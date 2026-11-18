import type { GroupImpact } from "./types.js";

/** What every source of a group is made to answer, as a multiple of now. */
export const SCORE_MULTIPLIER = 10;

/**
 * How far the final price moved, as a multiple of where it was, either way:
 * 1 for a price that did not move, 1.04 for one 4% off, and
 * {@link SCORE_MULTIPLIER} for one that took the whole lie — the most it can
 * take from one leg, and where a price over two legs of one group, moved
 * further, is held too.
 *
 * `null` for a price that stopped answering, which is not a move.
 */
export function scoreOfFactor(factor: number | null): number | null {
  if (factor === null || !Number.isFinite(factor) || factor <= 0) {
    return null;
  }
  const move = factor >= 1 ? factor : 1 / factor;
  return Math.min(SCORE_MULTIPLIER, move);
}

/**
 * The price a market settles on: the lower of main and reserve, or the main
 * feed's alone where there is no reserve to compare it with. `null` where a
 * feed it needs does not answer.
 */
export function finalPrice(
  main: bigint | null,
  reserve: bigint | null | undefined,
): bigint | null {
  if (main === null || reserve === null) {
    return null;
  }
  if (reserve === undefined) {
    return main;
  }
  return main < reserve ? main : reserve;
}

/** `stressed / base` as a float, `null` where the stressed price is gone. */
export function factorOf(base: bigint, stressed: bigint | null): number | null {
  if (stressed === null) {
    return null;
  }
  return Number(stressed) / Number(base);
}

/**
 * The market's score and the group it comes from: the furthest any group
 * moved its price. 1 where nothing moved it — no group did, or no source
 * feeds the price at all.
 *
 * A group under which the price stops answering moves nothing and does not
 * set the score; it is listed after those that do, for a reader to see.
 */
export function worstOf(impacts: GroupImpact[]): {
  score: number;
  impacts: GroupImpact[];
  worst: GroupImpact | null;
} {
  const sorted = [...impacts].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const worst = sorted.find(impact => impact.score !== null) ?? null;
  return { score: worst?.score ?? 1, impacts: sorted, worst };
}
