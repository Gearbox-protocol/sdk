import type { GroupScenarioOutcome, SlotOutcome } from "./types.js";

/**
 * Turning what a group did into a mark out of ten.
 *
 * Any single number over a thing this shaped is a judgement, so the one here
 * is spelled out rather than tuned: what it weighs, and why each term is
 * weighed that way, is in the comments below, and every figure it is computed
 * from stays in the report so a reader who disagrees can reweigh them.
 **/

/**
 * How bad one slot's outcome is, on nought to one.
 *
 * Two kinds of harm, which are not the same kind of problem:
 *
 *  - a wrong price. The collateral is valued against the market's underlying,
 *    so what matters is the ratio and not either leg: a market whose
 *    collateral and underlying both doubled has not moved. Overvalued
 *    collateral is borrowed against and the loan is never repaid; undervalued
 *    collateral is liquidated out from under an account that was solvent.
 *    Both are counted, because a reader asking what a source can do to them
 *    is exposed to each.
 *
 *  - a price that stopped. The slot reverted where it used to answer, which
 *    freezes the market: nothing can be borrowed and, worse, nothing can be
 *    liquidated. Scored at half a full mispricing — it is a liveness failure
 *    rather than a licence to drain, and it is also loud, where a wrong number
 *    is silent.
 *
 * A hundredfold move in the ratio is full harm. Ten times is a half, and the
 * curve is logarithmic between them because the damage is: a position is
 * liquidatable somewhere around a tenth of a move, and everything past that is
 * degrees of already-gone.
 */
export function slotHarm(slot: SlotOutcome): number {
  if (slot.feed.stressed === null && slot.feed.base !== null) {
    return 0.5;
  }

  const factor = slot.ratioFactor;
  if (factor === null || factor === 1 || !Number.isFinite(factor)) {
    // An unreadable ratio is not evidence of harm; a factor of exactly one is
    // evidence of none. An infinite one is the group having revalued the slot
    // without limit, which is the top of the scale.
    return factor !== null && !Number.isFinite(factor) ? 1 : 0;
  }

  return Math.min(1, Math.abs(Math.log10(factor)) / 2);
}

/**
 * The group's mark, over every scenario it was put through.
 *
 * Two views of the same slots, because either alone misleads. Weighing harm by
 * the quota riding on it is what a reader with money in the protocol wants —
 * a source that can only move a market with nothing in it has not done much.
 * But a market with nothing in it today is where tomorrow's deposit goes, so
 * the worst slot regardless of size is carried too, at a smaller weight.
 *
 * Ten is a group that moved nothing. Nought is one that revalued everything
 * the chain has out.
 */
export function scoreGroup(outcomes: GroupScenarioOutcome[]): number {
  let weighted = 0;
  let worst = 0;

  for (const outcome of outcomes) {
    const total = outcome.slots.reduce(
      (sum, slot) => sum + (slot.quotaUsedUsd ?? 0),
      0,
    );

    let scenarioWeighted = 0;
    for (const slot of outcome.slots) {
      const harm = slotHarm(slot);
      worst = Math.max(worst, harm);
      if (total > 0) {
        scenarioWeighted += ((slot.quotaUsedUsd ?? 0) / total) * harm;
      }
    }
    weighted = Math.max(weighted, scenarioWeighted);
  }

  const damage = 0.7 * weighted + 0.3 * worst;
  return Math.round((1 - damage) * 100) / 10;
}

/**
 * The one line the score stands for.
 *
 * Says which of the two failures the group causes, because the remedies
 * differ: a wrong price is answered with bounds and a second feed, a dead one
 * with a reserve feed and a staleness period.
 */
export function verdictOf(
  group: string,
  score: number,
  outcomes: GroupScenarioOutcome[],
  reachableSlots: number,
  reachableUsd: number,
  responsive: number,
  silentSources: number,
  undefendedPositions: number,
  selfContained: boolean,
): string {
  const money = () =>
    `$${Math.round(reachableUsd).toLocaleString("en-US")} of quota`;

  if (reachableSlots === 0) {
    return `${group} prices nothing any market reads.`;
  }

  // Said before anything else, because it is the reason the rest of the line
  // would otherwise be read the wrong way round.
  if (selfContained) {
    return `${group} carries its price in its own code and is not published to, so there is no source to lie: ${money()} behind ${reachableSlots} slot(s), at the mercy of whoever can replace the contract rather than of whoever reports to it.`;
  }
  if (outcomes.length === 0) {
    return `${group} is not answering as it stands — ${silentSources} silent source(s) — so nothing could be perturbed: ${money()} behind ${reachableSlots} slot(s) is priced through something already not reporting.`;
  }
  if (responsive === 0) {
    return `${group}: not one of its ${reachableSlots} slot(s) moved under a perturbation of a tenth of a percent, so this test never drove it. Treat every figure for it as unknown, not as safe.`;
  }

  const broken = Math.max(...outcomes.map(o => o.brokenSlots), 0);
  const inflation = Math.max(
    ...outcomes.map(o => o.worstInflation ?? 1),
    1,
  );
  const deflation = Math.min(...outcomes.map(o => o.worstDeflation ?? 1), 1);

  // Both ends, because they are different attacks: an inflated ratio is
  // borrowed against, a deflated one liquidates somebody solvent.
  const ends = [
    inflation > 1.01 ? `${inflation.toExponential(1)}× too high` : null,
    deflation < 0.99 ? `${deflation.toExponential(1)}× of what it should be` : null,
  ].filter((end): end is string => end !== null);

  const dead = Math.max(...outcomes.map(o => o.deadSlots), 0);
  const live = reachableSlots - dead;
  const moves =
    ends.length > 0
      ? `drives the collateral-to-underlying ratio of up to ${live} live slot(s) to ${ends.join(" and ")}`
      : `moves no ratio by more than a percent, with ${responsive} slot(s) proven to respond at all`;
  const freeze = broken > 0 ? `, and stops ${broken} of them answering` : "";
  // Said whatever the ratios did, because it is a structural fact rather than
  // a measurement: these positions have no second opinion to fall back on.
  const undefended =
    undefendedPositions > 0
      ? ` Its reach includes ${undefendedPositions} position(s) whose main and reserve feed both read it, so the fallback fails with it.`
      : "";
  const standing =
    dead > 0
      ? ` ${dead} of its slot(s) are priced through a feed that is not answering right now, before any of this.`
      : "";
  const silent =
    silentSources > 0
      ? ` (${silentSources} of its sources are already silent and were not perturbed)`
      : "";

  return `${group} (${score}/10): ${money()} behind it; ${moves}${freeze}.${undefended}${standing}${silent}`;
}
