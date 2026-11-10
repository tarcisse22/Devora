import { createRng } from "./random";

/** `n` distinct values in [1, 99], sorted — input for binary search. */
export function sortedUnique(n: number, seed: number): number[] {
  const rng = createRng(seed);
  const values = new Set<number>();
  while (values.size < Math.min(n, 99)) values.add(rng.int(1, 99));
  return [...values].sort((a, b) => a - b);
}

/** A search target: usually present in the array, sometimes absent. */
export function pickTarget(array: number[], seed: number): number {
  const rng = createRng(seed ^ 0x5bd1e995);
  if (array.length && rng.next() < 0.75) return rng.pick(array);
  let t = rng.int(1, 99);
  while (array.includes(t)) t = rng.int(1, 99);
  return t;
}
