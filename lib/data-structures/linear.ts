import { fail, frame, type DSFrame, type OpResult } from "./types";

/* ================================================================ Array */

export type ArrayState = { items: number[]; capacity: number };

export const arrayOps = {
  access(s: ArrayState, index: number): OpResult<ArrayState> {
    if (index < 0 || index >= s.items.length) return fail(s, `Index ${index} is out of bounds (valid: 0…${s.items.length - 1}).`);
    return { frames: [frame(s, `A[${index}] = ${s.items[index]}. Direct access by index is O(1): the address is computed, not searched.`, { [index]: "found" })] };
  },

  update(s: ArrayState, index: number, value: number): OpResult<ArrayState> {
    if (index < 0 || index >= s.items.length) return fail(s, `Index ${index} is out of bounds (valid: 0…${s.items.length - 1}).`);
    const items = [...s.items];
    const old = items[index];
    items[index] = value;
    return { frames: [frame({ ...s, items }, `Overwrite A[${index}]: ${old} → ${value}. O(1).`, { [index]: "new" })] };
  },

  insertAt(s: ArrayState, index: number, value: number): OpResult<ArrayState> {
    if (s.items.length >= s.capacity) return fail(s, `The array is full (capacity ${s.capacity}). A dynamic array would allocate a bigger block and copy everything.`);
    if (index < 0 || index > s.items.length) return fail(s, `Index ${index} is out of bounds for insertion (valid: 0…${s.items.length}).`);
    const shifted = s.items.length - index;
    const frames: DSFrame<ArrayState>[] = [];
    if (shifted > 0) {
      const marks = Object.fromEntries(Array.from({ length: shifted }, (_, k) => [index + k, "active" as const]));
      frames.push(frame(s, `Shift ${shifted} element${shifted === 1 ? "" : "s"} one place right to open a gap at index ${index}.`, marks));
    }
    const items = [...s.items.slice(0, index), value, ...s.items.slice(index)];
    frames.push(frame({ ...s, items }, `Write ${value} at index ${index}. ${shifted} element${shifted === 1 ? "" : "s"} moved — insertion is O(n).`, { [index]: "new" }));
    return { frames };
  },

  removeAt(s: ArrayState, index: number): OpResult<ArrayState> {
    if (index < 0 || index >= s.items.length) return fail(s, `Index ${index} is out of bounds (valid: 0…${s.items.length - 1}).`);
    const shifted = s.items.length - 1 - index;
    const items = [...s.items.slice(0, index), ...s.items.slice(index + 1)];
    const marks = Object.fromEntries(Array.from({ length: shifted }, (_, k) => [index + k, "active" as const]));
    return {
      frames: [
        frame(s, `Remove ${s.items[index]} at index ${index}.`, { [index]: "removed" }),
        frame({ ...s, items }, `Shift ${shifted} element${shifted === 1 ? "" : "s"} left to close the gap — deletion is O(n).`, marks),
      ],
    };
  },

  search(s: ArrayState, value: number): OpResult<ArrayState> {
    const frames: DSFrame<ArrayState>[] = [];
    for (let i = 0; i < s.items.length; i++) {
      if (s.items[i] === value) {
        frames.push(frame(s, `A[${i}] = ${value}. Found after ${i + 1} comparison${i ? "s" : ""}.`, { [i]: "found" }));
        return { frames };
      }
      frames.push(frame(s, `A[${i}] = ${s.items[i]} ≠ ${value}.`, { [i]: "active" }));
    }
    frames.push(frame(s, `${value} is not in the array — checked all ${s.items.length} elements (O(n)).`));
    return { frames, error: true };
  },
};

/* ========================================================== Linked list */

export type ListNode = { id: number; value: number };
export type LinkedListState = { nodes: ListNode[]; nextId: number };

const withNode = (s: LinkedListState, value: number) => ({ id: s.nextId, value });

/** Frames that walk from the head up to (and including) position `upTo`. */
function walk(s: LinkedListState, upTo: number, describe: (n: ListNode, i: number) => string) {
  const frames: DSFrame<LinkedListState>[] = [];
  for (let i = 0; i <= upTo && i < s.nodes.length; i++) {
    frames.push(frame(s, describe(s.nodes[i], i), { [s.nodes[i].id]: "active" }));
  }
  return frames;
}

export const linkedListOps = {
  pushFront(s: LinkedListState, value: number): OpResult<LinkedListState> {
    const node = withNode(s, value);
    const next = { nodes: [node, ...s.nodes], nextId: s.nextId + 1 };
    return { frames: [frame(next, `Create node ${value}, point its next at the old head, then move head to it. O(1).`, { [node.id]: "new" })] };
  },

  pushBack(s: LinkedListState, value: number): OpResult<LinkedListState> {
    const node = withNode(s, value);
    const next = { nodes: [...s.nodes, node], nextId: s.nextId + 1 };
    const tail = s.nodes.at(-1);
    return {
      frames: [
        ...(tail ? [frame(s, `The list keeps a tail pointer, so we jump straight to the last node (${tail.value}).`, { [tail.id]: "active" })] : []),
        frame(next, `Link ${value} after the tail and move tail to it. O(1) thanks to the tail pointer.`, { [node.id]: "new" }),
      ],
    };
  },

  insertAt(s: LinkedListState, index: number, value: number): OpResult<LinkedListState> {
    if (index < 0 || index > s.nodes.length) return fail(s, `Position ${index} is out of range (valid: 0…${s.nodes.length}).`);
    if (index === 0) return linkedListOps.pushFront(s, value);
    const frames = walk(s, index - 1, (n, i) => (i === index - 1 ? `Reached node ${n.value} at position ${i} — the new node goes after it.` : `Follow next pointer: node ${n.value} (position ${i}).`));
    const node = withNode(s, value);
    const nodes = [...s.nodes.slice(0, index), node, ...s.nodes.slice(index)];
    frames.push(frame({ nodes, nextId: s.nextId + 1 }, `Point ${value}.next at the following node, then the previous node's next at ${value}. Walking there made it O(n).`, { [node.id]: "new" }));
    return { frames };
  },

  remove(s: LinkedListState, value: number): OpResult<LinkedListState> {
    const index = s.nodes.findIndex((n) => n.value === value);
    const frames = walk(s, index === -1 ? s.nodes.length - 1 : index, (n) => (n.value === value ? `Found ${value}.` : `${n.value} ≠ ${value} — follow next.`));
    if (index === -1) {
      frames.push(frame(s, `${value} is not in the list.`));
      return { frames, error: true };
    }
    const target = s.nodes[index];
    frames[frames.length - 1] = frame(s, `Found ${value} at position ${index}.`, { [target.id]: "removed" });
    const nodes = s.nodes.filter((_, i) => i !== index);
    const msg = index === 0 ? `Move head to the next node. ${value} is unlinked.` : `Point the previous node's next past ${value}, unlinking it.`;
    frames.push(frame({ ...s, nodes }, msg, nodes[index - 1] ? { [nodes[index - 1].id]: "active" } : {}));
    return { frames };
  },

  search(s: LinkedListState, value: number): OpResult<LinkedListState> {
    const index = s.nodes.findIndex((n) => n.value === value);
    const frames = walk(s, index === -1 ? s.nodes.length - 1 : index, (n, i) => (n.value === value ? `Found ${value} at position ${i}.` : `${n.value} ≠ ${value} — follow next.`));
    if (index === -1) {
      frames.push(frame(s, `Reached null — ${value} is not in the list. Search is O(n): no random access.`));
      return { frames, error: true };
    }
    frames[frames.length - 1].marks = { [s.nodes[index].id]: "found" };
    return { frames };
  },

  traverse(s: LinkedListState): OpResult<LinkedListState> {
    if (s.nodes.length === 0) return fail(s, "The list is empty.");
    const seen: number[] = [];
    const frames = s.nodes.map((n) => {
      seen.push(n.value);
      return frame(s, `Visit ${n.value}. Order so far: ${seen.join(" → ")}`, { [n.id]: "active" });
    });
    frames.push(frame(s, `Reached null. Traversal visited ${s.nodes.length} nodes: ${seen.join(" → ")}.`));
    return { frames };
  },

  reverse(s: LinkedListState): OpResult<LinkedListState> {
    if (s.nodes.length < 2) return fail(s, "Reversing needs at least two nodes.");
    const frames: DSFrame<LinkedListState>[] = [];
    for (let i = 1; i <= s.nodes.length; i++) {
      const nodes = [...s.nodes.slice(0, i).reverse(), ...s.nodes.slice(i)];
      const marks = Object.fromEntries(s.nodes.slice(0, i).map((n) => [n.id, "path" as const]));
      frames.push(frame({ ...s, nodes }, `Re-point ${s.nodes[i - 1].value}.next backwards. ${i} of ${s.nodes.length} nodes reversed.`, marks));
    }
    frames.push(frame(frames.at(-1)!.state, "Head now points at the old tail. Reversed in one pass: O(n) time, O(1) extra space."));
    return { frames };
  },
};

/* =============================================================== Stack */

export type StackState = { items: number[]; capacity: number };

export const stackOps = {
  push(s: StackState, value: number): OpResult<StackState> {
    if (s.items.length >= s.capacity) return fail(s, `Stack overflow — the stack is full (capacity ${s.capacity}).`);
    const items = [...s.items, value];
    return { frames: [frame({ ...s, items }, `Push ${value} onto the top. O(1).`, { [items.length - 1]: "new" })] };
  },
  pop(s: StackState): OpResult<StackState> {
    if (s.items.length === 0) return fail(s, "Stack underflow — there is nothing to pop.");
    const top = s.items.length - 1;
    return {
      frames: [
        frame(s, `Pop removes the top element, ${s.items[top]} (last in, first out).`, { [top]: "removed" }),
        frame({ ...s, items: s.items.slice(0, -1) }, `Popped ${s.items[top]}. O(1).`),
      ],
    };
  },
  peek(s: StackState): OpResult<StackState> {
    if (s.items.length === 0) return fail(s, "The stack is empty — nothing to peek at.");
    const top = s.items.length - 1;
    return { frames: [frame(s, `Peek: the top is ${s.items[top]}. Nothing is removed. O(1).`, { [top]: "found" })] };
  },
};

/* =============================================================== Queue */

export type QueueState = { items: number[]; capacity: number };

export const queueOps = {
  enqueue(s: QueueState, value: number): OpResult<QueueState> {
    if (s.items.length >= s.capacity) return fail(s, `The queue is full (capacity ${s.capacity}).`);
    const items = [...s.items, value];
    return { frames: [frame({ ...s, items }, `Enqueue ${value} at the rear. O(1).`, { [items.length - 1]: "new" })] };
  },
  dequeue(s: QueueState): OpResult<QueueState> {
    if (s.items.length === 0) return fail(s, "The queue is empty — nothing to dequeue.");
    return {
      frames: [
        frame(s, `Dequeue removes the front element, ${s.items[0]} (first in, first out).`, { 0: "removed" }),
        frame({ ...s, items: s.items.slice(1) }, `Dequeued ${s.items[0]}. With a circular buffer or linked list this is O(1).`),
      ],
    };
  },
  peek(s: QueueState): OpResult<QueueState> {
    if (s.items.length === 0) return fail(s, "The queue is empty — nothing to peek at.");
    return { frames: [frame(s, `Peek: the front is ${s.items[0]}. Nothing is removed. O(1).`, { 0: "found" })] };
  },
};
