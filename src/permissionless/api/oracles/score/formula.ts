import type { GroupImpact } from "./types.js";

/** What every source of a group is made to answer, as a multiple of now. */
export const SCORE_MULTIPLIER = 5;

/**
 * The score of a price that stops answering under the lie.
 *
 * Half marks: nobody can borrow against a wrong number, but nobody can be
 * liquidated either until the feed is replaced.
 */
export const REVERT_SCORE = 5;

/**
 * 0 to 10 by how far the final price moved, on a log scale against the lie
 * itself: 10 for a price that did not move, 0 for one that moved by the full
 * {@link SCORE_MULTIPLIER} or more, either way. Rounded to a half point.
 *
 * A bound holding a price within a few percent keeps a 10; a price that let
 * half the lie through, ×√5, scores 5.
 */
export function scoreOfFactor(factor: number | null): number {
  if (factor === null || !Number.isFinite(factor) || factor <= 0) {
    return REVERT_SCORE;
  }
  const moved = Math.abs(Math.log(factor)) / Math.log(SCORE_MULTIPLIER);
  return Math.round(10 * Math.max(0, 1 - moved) * 2) / 2;
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
 * The market's score and the group it comes from: the lowest of its groups,
 * ties going to the group that moved the price further. 10 where no source
 * feeds the price at all, since nothing can be made to lie about it.
 */
export function worstOf(impacts: GroupImpact[]): {
  score: number;
  impacts: GroupImpact[];
  worst: GroupImpact | null;
} {
  const distance = (impact: GroupImpact) =>
    impact.factor === null ? Infinity : Math.abs(Math.log(impact.factor));
  const sorted = [...impacts].sort(
    (a, b) => a.score - b.score || distance(b) - distance(a),
  );
  const worst = sorted[0] ?? null;
  return { score: worst?.score ?? 10, impacts: sorted, worst };
}
