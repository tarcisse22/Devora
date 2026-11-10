/** Search algorithms that record a frame for every step. */

export type SearchFrame = {
  array: number[];
  target: number;
  /** Index currently being examined. */
  current?: number;
  lo?: number;
  hi?: number;
  /** Indices ruled out so far. */
  eliminated: number[];
  /** Index where the target was found, null if not found yet / absent. */
  found: number | null;
  done: boolean;
  line: number;
  message: string;
  comparisons: number;
};

export function linearSearch(array: number[], target: number): SearchFrame[] {
  const frames: SearchFrame[] = [];
  const eliminated: number[] = [];
  let comparisons = 0;
  const push = (f: Omit<SearchFrame, "array" | "target" | "eliminated" | "comparisons">) =>
    frames.push({ ...f, array, target, eliminated: [...eliminated], comparisons });

  push({ found: null, done: false, line: 1, message: `Look for ${target} by checking each value from left to right.` });
  for (let i = 0; i < array.length; i++) {
    comparisons++;
    const hit = array[i] === target;
    push({ current: i, found: hit ? i : null, done: hit, line: hit ? 3 : 2, message: hit ? `${array[i]} = ${target}. Found at index ${i}.` : `${array[i]} ≠ ${target}. Move on.` });
    if (hit) return frames;
    eliminated.push(i);
  }
  push({ found: null, done: true, line: 4, message: `Checked all ${array.length} values — ${target} is not in the array.` });
  return frames;
}

export function binarySearch(sorted: number[], target: number): SearchFrame[] {
  const frames: SearchFrame[] = [];
  const eliminated = new Set<number>();
  let comparisons = 0;
  const push = (f: Omit<SearchFrame, "array" | "target" | "eliminated" | "comparisons">) =>
    frames.push({ ...f, array: sorted, target, eliminated: [...eliminated], comparisons });

  let lo = 0;
  let hi = sorted.length - 1;
  push({ lo, hi, found: null, done: false, line: 1, message: `The array is sorted. Search for ${target} between index ${lo} and ${hi}.` });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    push({ lo, hi, current: mid, found: null, done: false, line: 3, message: `Middle of [${lo}…${hi}] is index ${mid} (value ${sorted[mid]}).` });
    comparisons++;
    if (sorted[mid] === target) {
      push({ lo, hi, current: mid, found: mid, done: true, line: 4, message: `${sorted[mid]} = ${target}. Found at index ${mid}.` });
      return frames;
    }
    if (sorted[mid] < target) {
      for (let k = lo; k <= mid; k++) eliminated.add(k);
      lo = mid + 1;
      push({ lo, hi, current: mid, found: null, done: false, line: 5, message: `${sorted[mid]} < ${target}, so the target can only be to the right. Discard the left half.` });
    } else {
      for (let k = mid; k <= hi; k++) eliminated.add(k);
      hi = mid - 1;
      push({ lo, hi, current: mid, found: null, done: false, line: 6, message: `${sorted[mid]} > ${target}, so the target can only be to the left. Discard the right half.` });
    }
  }
  push({ found: null, done: true, line: 7, message: `The search range is empty — ${target} is not in the array.` });
  return frames;
}
