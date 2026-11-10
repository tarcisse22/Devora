"use client";

import { ArrayWorkbench, LinkedListWorkbench, QueueWorkbench, StackWorkbench } from "./linear-workbenches";
import { BinaryTreeWorkbench, BSTWorkbench, GraphWorkbench, HashTableWorkbench, HeapWorkbench } from "./other-workbenches";

const workbenches: Record<string, () => React.JSX.Element> = {
  array: ArrayWorkbench,
  "linked-list": LinkedListWorkbench,
  stack: StackWorkbench,
  queue: QueueWorkbench,
  "binary-tree": BinaryTreeWorkbench,
  bst: BSTWorkbench,
  heap: HeapWorkbench,
  "hash-table": HashTableWorkbench,
  graph: GraphWorkbench,
};

export function DataStructureWorkbench({ slug }: { slug: string }) {
  const Workbench = workbenches[slug];
  return Workbench ? <Workbench /> : null;
}
