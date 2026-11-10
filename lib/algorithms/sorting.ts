/**
 * Sorting algorithms that record a frame for every meaningful operation.
 * Each frame is a snapshot of real state, so the visualization is a replay of
 * actual execution — not a scripted animation.
 */

export type SortFrame = {
  array: number[];
  /** Indices being compared. */
  compare?: [number, number];
  /** Indices just swapped. */
  swap?: [number, number];
  /** Index just overwritten (insertion / merge). */
  write?: number;
  pivot?: number;
  /** Active sub-array [lo, hi] (merge / quick sort). */
  range?: [number, number];
  /** Indices in their final position. */
  sorted: number[];
  /** 1-based line in the algorithm's pseudocode. */
  line: number;
  message: string;
  comparisons: number;
  writes: number;
};

class Recorder {
  frames: SortFrame[] = [];
  comparisons = 0;
  writes = 0;
  sorted = new Set<number>();
  constructor(public a: number[]) {}

  push(f: Omit<SortFrame, "array" | "sorted" | "comparisons" | "writes">) {
    this.frames.push({
      ...f,
      array: [...this.a],
      sorted: [...this.sorted],
      comparisons: this.comparisons,
      writes: this.writes,
    });
  }
  less(i: number, j: number) {
    this.comparisons++;
    return this.a[i] < this.a[j];
  }
  swap(i: number, j: number) {
    [this.a[i], this.a[j]] = [this.a[j], this.a[i]];
    if (i !== j) this.writes += 2;
  }
  allSorted() {
    this.a.forEach((_, i) => this.sorted.add(i));
  }
}

export function bubbleSort(input: number[]): SortFrame[] {
  const r = new Recorder([...input]);
  const a = r.a;
  const n = a.length;
  r.push({ line: 1, message: `Start: ${n} values. Repeatedly swap adjacent values that are out of order.` });
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      r.comparisons++;
      const outOfOrder = a[j] > a[j + 1];
      r.push({ compare: [j, j + 1], line: 3, message: `Compare ${a[j]} and ${a[j + 1]}${outOfOrder ? " — out of order." : " — already in order."}` });
      if (outOfOrder) {
        r.swap(j, j + 1);
        swapped = true;
        r.push({ swap: [j, j + 1], line: 4, message: `Swap them, so ${a[j + 1]} moves right.` });
      }
    }
    r.sorted.add(n - 1 - i);
    r.push({ line: 5, message: `Pass ${i + 1} done: ${a[n - 1 - i]} has bubbled to its final position.` });
    if (!swapped) {
      r.allSorted();
      r.push({ line: 6, message: "No swaps in this pass, so the array is sorted. Stop early." });
      return r.frames;
    }
  }
  r.allSorted();
  r.push({ line: 6, message: "Sorted." });
  return r.frames;
}

export function selectionSort(input: number[]): SortFrame[] {
  const r = new Recorder([...input]);
  const a = r.a;
  const n = a.length;
  r.push({ line: 1, message: "Start. Repeatedly select the smallest remaining value and move it to the front." });
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    r.push({ pivot: min, line: 2, message: `Assume ${a[i]} at index ${i} is the smallest remaining value.` });
    for (let j = i + 1; j < n; j++) {
      const smaller = r.less(j, min);
      r.push({ compare: [j, min], pivot: min, line: 4, message: `Compare ${a[j]} with current minimum ${a[min]}.` });
      if (smaller) {
        min = j;
        r.push({ pivot: min, line: 5, message: `${a[min]} is smaller — it becomes the new minimum.` });
      }
    }
    r.swap(i, min);
    r.sorted.add(i);
    r.push({
      swap: min !== i ? [i, min] : undefined,
      line: 6,
      message: min !== i ? `Swap ${a[i]} into index ${i}.` : `${a[i]} is already in place at index ${i}.`,
    });
  }
  r.allSorted();
  r.push({ line: 6, message: "Sorted." });
  return r.frames;
}

export function insertionSort(input: number[]): SortFrame[] {
  const r = new Recorder([...input]);
  const a = r.a;
  const n = a.length;
  r.sorted.add(0);
  r.push({ line: 1, message: "Start. The first value on its own is a sorted prefix." });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    r.push({ pivot: i, line: 2, message: `Take ${key} and insert it into the sorted prefix on its left.` });
    while (j >= 0) {
      r.comparisons++;
      r.push({ compare: [j, j + 1], line: 3, message: `Is ${a[j]} greater than ${key}?` });
      if (a[j] <= key) break;
      a[j + 1] = a[j];
      r.writes++;
      r.push({ write: j + 1, line: 4, message: `Yes — shift ${a[j]} one place right.` });
      j--;
    }
    a[j + 1] = key;
    r.writes++;
    for (let k = 0; k <= i; k++) r.sorted.add(k);
    r.push({ write: j + 1, line: 5, message: `Place ${key} at index ${j + 1}. The first ${i + 1} values are now sorted.` });
  }
  r.allSorted();
  r.push({ line: 5, message: "Sorted." });
  return r.frames;
}

export function mergeSort(input: number[]): SortFrame[] {
  const r = new Recorder([...input]);
  const a = r.a;
  r.push({ line: 1, message: "Start. Split the array in half, sort each half, then merge them." });

  const sort = (lo: number, hi: number) => {
    if (hi <= lo) return;
    const mid = Math.floor((lo + hi) / 2);
    r.push({ range: [lo, hi], line: 3, message: `Split [${lo}…${hi}] at ${mid}.` });
    sort(lo, mid);
    sort(mid + 1, hi);
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    r.push({ range: [lo, hi], line: 5, message: `Merge [${left.join(", ")}] and [${right.join(", ")}].` });
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      r.comparisons++;
      const takeLeft = left[i] <= right[j];
      a[k] = takeLeft ? left[i++] : right[j++];
      r.writes++;
      r.push({ write: k, range: [lo, hi], line: 6, message: `${a[k]} is the smaller front value — write it to index ${k}.` });
      k++;
    }
    while (i < left.length) {
      a[k] = left[i++];
      r.writes++;
      r.push({ write: k, range: [lo, hi], line: 7, message: `Copy remaining ${a[k]} to index ${k}.` });
      k++;
    }
    while (j < right.length) {
      a[k] = right[j++];
      r.writes++;
      r.push({ write: k, range: [lo, hi], line: 7, message: `Copy remaining ${a[k]} to index ${k}.` });
      k++;
    }
    if (lo === 0 && hi === a.length - 1) r.allSorted();
  };

  sort(0, a.length - 1);
  r.allSorted();
  r.push({ line: 1, message: "Sorted." });
  return r.frames;
}

export function quickSort(input: number[]): SortFrame[] {
  const r = new Recorder([...input]);
  const a = r.a;
  r.push({ line: 1, message: "Start. Pick a pivot, partition smaller values to its left, then recurse." });

  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      r.sorted.add(lo);
      r.push({ range: [lo, hi], line: 2, message: `A single value (${a[lo]}) is already in place.` });
      return;
    }
    const pivot = a[hi];
    let i = lo;
    r.push({ pivot: hi, range: [lo, hi], line: 3, message: `Partition [${lo}…${hi}] around pivot ${pivot} (the last value).` });
    for (let j = lo; j < hi; j++) {
      r.comparisons++;
      r.push({ compare: [j, hi], pivot: hi, range: [lo, hi], line: 5, message: `Is ${a[j]} < ${pivot}?` });
      if (a[j] < pivot) {
        r.swap(i, j);
        r.push({ swap: i !== j ? [i, j] : undefined, pivot: hi, range: [lo, hi], line: 5, message: `Yes — move ${a[i]} into the “smaller” side at index ${i}.` });
        i++;
      }
    }
    r.swap(i, hi);
    r.sorted.add(i);
    r.push({ swap: i !== hi ? [i, hi] : undefined, range: [lo, hi], line: 6, message: `Place pivot ${pivot} at index ${i} — its final position.` });
    sort(lo, i - 1);
    sort(i + 1, hi);
  };

  sort(0, a.length - 1);
  r.allSorted();
  r.push({ line: 7, message: "Sorted." });
  return r.frames;
}
