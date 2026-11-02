import type { MarketScore, ScoredFeed } from "./types.js";

/**
 * How well a market guards an asset's price, from its two feeds alone.
 *
 * Two questions, and the points are lost for each separately:
 *
 * - Would the reserve disagree with a main feed that has gone wrong? Only if
 *   it is a second feed on other sources. A missing reserve, a
 *   `ZeroPriceFeed`, the main feed again, and a different feed on the same
 *   sources all answer no.
 * - Is either feed bounded? A `BoundedPriceFeed` caps the answer from above,
 *   and a Gearbox LP feed clamps its exchange rate to a window.
 *
 * Independence costs more than the bound, 6 points against 5, because it is
 * the broader protection: a bounded feed caps only from above, and an LP
 * feed's window holds only its rate, not the price of what the rate is in.
 * Either failure alone lands a market at 4 or 5; both together at 0.
 */
export const INDEPENDENCE_WEIGHT = 6;
export const BOUND_WEIGHT = 5;

/**
 * The feed types that bound what they answer: the `BoundedPriceFeed`, and
 * every Gearbox LP feed, all of which clamp the rate they read.
 */
const BOUNDED_TYPE =
  /::(BOUNDED|ERC4626|CURVE_\w+|WSTETH|YEARN|MELLOW\w*|BALANCER\w*)$/;

const ZERO_TYPE = "PRICE_FEED::ZERO";

/** A source, as the overlap between two feeds is counted. */
export interface ScoreSource {
  /** What two feeds have to share to be on the same source. */
  key: string;
  /** What a reader is told. */
  name: string;
  /** A source the classifier named, rather than one grouped alone. */
  identified: boolean;
}

/**
 * The share of the two sides' sources that are not shared, by key.
 *
 * Nothing on either side — two hardcoded prices — is 0, because a reserve is
 * there to be a second opinion and neither of them is one.
 */
function independenceOf(main: ScoreSource[], reserve: ScoreSource[]): number {
  const a = new Set(main.map(source => source.key));
  const b = new Set(reserve.map(source => source.key));
  const union = new Set([...a, ...b]);
  if (union.size === 0) {
    return 0;
  }
  const shared = [...a].filter(key => b.has(key)).length;
  return 1 - shared / union.size;
}

/** Down to the half point, so that a score is never rounded up into a band. */
function toHalf(value: number): number {
  return Math.floor(value * 2 + 1e-9) / 2;
}

/**
 * One market's score for one asset.
 *
 * `reserve` is `null` where the market holds no reserve for the asset at all.
 * A source is passed per side and keyed by the caller, which is where it is
 * decided that an unnamed source is its own contract and a named one is its
 * group.
 */
export function scoreMarket(
  market: Omit<
    MarketScore,
    | "main"
    | "reserve"
    | "hasReserve"
    | "independence"
    | "bounded"
    | "sharedSources"
    | "unverified"
    | "score"
    | "reasons"
  >,
  main: { feed: Omit<ScoredFeed, "sources">; sources: ScoreSource[] },
  reserve: { feed: Omit<ScoredFeed, "sources">; sources: ScoreSource[] } | null,
): MarketScore {
  const reasons: string[] = [];

  let hasReserve = true;
  if (reserve === null) {
    hasReserve = false;
    reasons.push("no reserve feed");
  } else if (reserve.feed.contractType === ZERO_TYPE) {
    hasReserve = false;
    reasons.push("reserve is a ZeroPriceFeed");
  } else if (reserve.feed.feed.toLowerCase() === main.feed.feed.toLowerCase()) {
    hasReserve = false;
    reasons.push("reserve is the main feed");
  }

  const reserveSources = hasReserve && reserve ? reserve.sources : [];
  const independence = hasReserve
    ? independenceOf(main.sources, reserveSources)
    : 0;

  const reserveKeys = new Set(reserveSources.map(source => source.key));
  const mainKeys = new Set(main.sources.map(source => source.key));
  const shared = main.sources.filter(source => reserveKeys.has(source.key));
  // Two distinct sources can go by one name (two Chainlink aggregators).
  const names = (sources: ScoreSource[]) => [
    ...new Set(sources.map(source => source.name)),
  ];
  if (hasReserve && independence < 1) {
    reasons.push(
      shared.length > 0
        ? `main and reserve share ${names(shared).join(", ")}`
        : "neither feed reads a price source",
    );
  }

  // An unnamed source that only one side has is what the independence above
  // is built on; one both sides have is the same contract, already shared.
  const unverified =
    hasReserve &&
    [
      ...main.sources.filter(source => !reserveKeys.has(source.key)),
      ...reserveSources.filter(source => !mainKeys.has(source.key)),
    ].some(source => !source.identified);

  const bounded =
    BOUNDED_TYPE.test(main.feed.contractType) ||
    (reserve !== null && BOUNDED_TYPE.test(reserve.feed.contractType));
  if (!bounded) {
    reasons.push("neither feed is bounded");
  }

  const score = toHalf(
    Math.max(
      0,
      10 -
        INDEPENDENCE_WEIGHT * (1 - independence) -
        BOUND_WEIGHT * (bounded ? 0 : 1),
    ),
  );

  return {
    ...market,
    main: { ...main.feed, sources: names(main.sources) },
    reserve: reserve ? { ...reserve.feed, sources: names(reserve.sources) } : null,
    hasReserve,
    independence,
    bounded,
    sharedSources: names(shared),
    unverified,
    score,
    reasons,
  };
}
