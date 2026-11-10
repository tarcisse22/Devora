/** Small seeded PRNG (mulberry32) so generated inputs are reproducible. */
export function createRng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T,>(items: readonly T[]) => items[Math.floor(next() * items.length)],
  };
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

/** `n` distinct-ish values in [5, 99] for sorting/searching visualizations. */
export function randomArray(n: number, seed: number): number[] {
  const rng = createRng(seed);
  return Array.from({ length: n }, () => rng.int(5, 99));
}
