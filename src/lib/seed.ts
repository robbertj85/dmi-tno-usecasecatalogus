/**
 * Deterministic pseudo-randomness.
 *
 * The card artwork is generated from the use-case id, never from Math.random,
 * so the server and the browser draw exactly the same thing and a given use
 * case keeps its artwork across builds.
 */

/** FNV-1a, 32-bit. */
export function hash(text: string): number {
  let value = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/** mulberry32 — small, fast, good enough for decorative geometry. */
export function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A seeded generator with the range helpers the motifs need. */
export function seeded(text: string) {
  const next = rng(hash(text));
  return {
    next,
    between: (min: number, max: number) => min + next() * (max - min),
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    pick: <T>(items: readonly T[]) => items[Math.floor(next() * items.length)],
  };
}

/** Trim float noise out of generated path data. */
export const r1 = (value: number) => Math.round(value * 10) / 10;
