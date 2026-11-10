"use client";

import { useState } from "react";
import { arrayOps, linkedListOps, queueOps, stackOps, type ArrayState, type LinkedListState, type QueueState, type StackState } from "@/lib/data-structures/linear";
import { DSShell, Field, NumberInput, OpButton, shellProps } from "./ds-shell";
import { useOpRunner } from "./use-op-runner";
import { ArrayView, LinkedListView, QueueView, StackView } from "./views";

const randomValue = () => 1 + Math.floor(Math.random() * 99);

/** A value input that suggests a fresh random value after each use. */
function useValue(initial: number) {
  const [value, setValue] = useState(initial);
  return { value, setValue, refresh: () => setValue(randomValue()) };
}

const Divider = () => <span aria-hidden className="mx-1 hidden h-6 w-px bg-line sm:block" />;

/* ---------------------------------------------------------------- array */

const arrayInitial: ArrayState = { items: [12, 45, 7, 23, 56], capacity: 10 };

export function ArrayWorkbench() {
  const r = useOpRunner(arrayInitial, "An array of 5 values with room for 10. Pick an operation above.");
  const v = useValue(31);
  const [index, setIndex] = useState(2);
  const maxIndex = Math.max(0, r.state.items.length);

  return (
    <DSShell
      {...shellProps(r)}
      controls={
        <>
          <Field label="Value">
            <NumberInput label="Value" value={v.value} onChange={v.setValue} />
          </Field>
          <Field label="Index">
            <NumberInput label="Index" value={index} onChange={setIndex} max={maxIndex} />
          </Field>
          <Divider />
          <OpButton primary disabled={r.busy} onClick={() => (r.run(`Insert ${v.value} at [${index}]`, arrayOps.insertAt(r.state, index, v.value)), v.refresh())}>
            Insert at
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run(`Remove [${index}]`, arrayOps.removeAt(r.state, index))}>
            Remove at
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run(`Update [${index}] = ${v.value}`, arrayOps.update(r.state, index, v.value))}>
            Update
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run(`Access [${index}]`, arrayOps.access(r.state, index))}>
            Access
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run(`Search ${v.value}`, arrayOps.search(r.state, v.value))}>
            Search
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.load(arrayInitial, "Reset to the starting array.")}>
            Reset
          </OpButton>
        </>
      }
      canvas={<ArrayView items={r.view.state.items} capacity={r.view.state.capacity} marks={r.view.marks} />}
    />
  );
}

/* ---------------------------------------------------------- linked list */

const listInitial: LinkedListState = {
  nodes: [3, 8, 15, 21].map((value, i) => ({ id: i + 1, value })),
  nextId: 5,
};

export function LinkedListWorkbench() {
  const r = useOpRunner(listInitial, "A singly linked list with head and tail pointers. Pick an operation above.");
  const v = useValue(10);
  const [pos, setPos] = useState(2);

  return (
    <DSShell
      {...shellProps(r)}
      controls={
        <>
          <Field label="Value">
            <NumberInput label="Value" value={v.value} onChange={v.setValue} />
          </Field>
          <Field label="Position">
            <NumberInput label="Position" value={pos} onChange={setPos} max={r.state.nodes.length} />
          </Field>
          <Divider />
          <OpButton primary disabled={r.busy || r.state.nodes.length >= 10} onClick={() => (r.run(`Push front ${v.value}`, linkedListOps.pushFront(r.state, v.value)), v.refresh())}>
            Push front
          </OpButton>
          <OpButton disabled={r.busy || r.state.nodes.length >= 10} onClick={() => (r.run(`Push back ${v.value}`, linkedListOps.pushBack(r.state, v.value)), v.refresh())}>
            Push back
          </OpButton>
          <OpButton disabled={r.busy || r.state.nodes.length >= 10} onClick={() => (r.run(`Insert ${v.value} at ${pos}`, linkedListOps.insertAt(r.state, pos, v.value)), v.refresh())}>
            Insert at
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run(`Remove ${v.value}`, linkedListOps.remove(r.state, v.value))}>
            Remove value
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run(`Search ${v.value}`, linkedListOps.search(r.state, v.value))}>
            Search
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run("Traverse", linkedListOps.traverse(r.state))}>
            Traverse
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run("Reverse", linkedListOps.reverse(r.state))}>
            Reverse
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.load(listInitial, "Reset to the starting list.")}>
            Reset
          </OpButton>
        </>
      }
      canvas={<LinkedListView nodes={r.view.state.nodes} marks={r.view.marks} />}
    />
  );
}

/* ---------------------------------------------------------------- stack */

const stackInitial: StackState = { items: [4, 9, 2], capacity: 7 };

export function StackWorkbench() {
  const r = useOpRunner(stackInitial, "A stack holding 3 values. Only the top is accessible.");
  const v = useValue(6);
  return (
    <DSShell
      {...shellProps(r)}
      controls={
        <>
          <Field label="Value">
            <NumberInput label="Value" value={v.value} onChange={v.setValue} onEnter={() => r.run(`Push ${v.value}`, stackOps.push(r.state, v.value))} />
          </Field>
          <Divider />
          <OpButton primary disabled={r.busy} onClick={() => (r.run(`Push ${v.value}`, stackOps.push(r.state, v.value)), v.refresh())}>
            Push
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run("Pop", stackOps.pop(r.state))}>
            Pop
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run("Peek", stackOps.peek(r.state))}>
            Peek
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.load(stackInitial, "Reset to the starting stack.")}>
            Reset
          </OpButton>
        </>
      }
      canvas={<StackView items={r.view.state.items} capacity={r.view.state.capacity} marks={r.view.marks} />}
    />
  );
}

/* ---------------------------------------------------------------- queue */

const queueInitial: QueueState = { items: [5, 1, 8], capacity: 8 };

export function QueueWorkbench() {
  const r = useOpRunner(queueInitial, "A queue holding 3 values. The front is served first.");
  const v = useValue(12);
  return (
    <DSShell
      {...shellProps(r)}
      controls={
        <>
          <Field label="Value">
            <NumberInput label="Value" value={v.value} onChange={v.setValue} />
          </Field>
          <Divider />
          <OpButton primary disabled={r.busy} onClick={() => (r.run(`Enqueue ${v.value}`, queueOps.enqueue(r.state, v.value)), v.refresh())}>
            Enqueue
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run("Dequeue", queueOps.dequeue(r.state))}>
            Dequeue
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run("Peek", queueOps.peek(r.state))}>
            Peek
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.load(queueInitial, "Reset to the starting queue.")}>
            Reset
          </OpButton>
        </>
      }
      canvas={<QueueView items={r.view.state.items} capacity={r.view.state.capacity} marks={r.view.marks} />}
    />
  );
}
