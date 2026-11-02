import type { Address } from "viem";

/**
 * How a source is made to lie.
 *
 * `feed` is a price feed that reads nothing else on chain — a Chainlink
 * aggregator, a Redstone or Pyth feed, a protocol's own rate adapter — and is
 * perturbed by overriding what it answers.
 *
 * `rate` is the contract a Gearbox LP feed reads an exchange rate from: the
 * wstETH token, an ERC-4626 vault, a Curve pool. The feed itself is not
 * overridden, because it also reads the price of what the rate is denominated
 * in — overriding the whole feed would charge the protocol with a failure of
 * whatever prices its underlying.
 **/
export type StressSourceKind = "feed" | "rate";

/**
 * One thing that can lie, and what happens downstream when it does.
 *
 * A source is not a feed. Several feeds can read the same aggregator, and
 * several of an oracle's trees can carry the same node; what the test varies
 * is the contract, once, and then looks at every feed built over it.
 **/
export interface StressSource {
  chainId: number;
  /**
   * The set it fails with.
   *
   * Sources sharing a group are taken to fail together, which is the whole
   * reason for grouping: Chainlink's feeds share an operator and an
   * infrastructure, so a reader who trusts one trusts all of them. A source
   * nothing else is correlated with is a group of one, which is the honest
   * answer rather than a bucket named "other".
   */
  group: string;
  kind: StressSourceKind;
  /** The contract overridden. */
  target: Address;
  /**
   * The feed the source governs, which for a `feed` source is the target
   * itself and for a `rate` source is the LP feed reading it.
   */
  feed: Address;
  /** Gearbox contract type of that feed, or `""` for one it never deployed. */
  contractType: string;
  /** What the feed says it is, which is how most sources are identified. */
  description: string;
  /**
   * Whether the group was recognised or only inferred from the feed itself.
   *
   * `false` is not a failure — the source is still perturbed and still
   * scored — but it is a group of one named after a description, so a reader
   * cannot tell whether it shares a fate with anything else. The share of
   * value behind unidentified sources is this analysis's blind spot and is
   * reported as such.
   */
  identified: boolean;
  /** Which rule named the group, so a reader can audit the partition. */
  via: string;
  /**
   * Whether anything feeds this source at all.
   *
   * `false` for a feed that carries its answer in its own code — a constant,
   * a zero — which cannot report a wrong price because nobody reports one to
   * it. Such a feed is still a risk, but the risk is whoever can replace the
   * contract, not whoever publishes to it, and overriding it would be
   * measuring the wrong thing. Reported and not simulated.
   */
  perturbable: boolean;
  /**
   * What the source reports now, or `null` for one that is not answering.
   *
   * A source with no baseline is left out of every override: a contract that
   * says nothing cannot be made to say something else, and inventing a figure
   * for it would be testing a feed that does not exist. A group whose sources
   * are all like this scores well because it can do nothing — which is worth
   * knowing, but is not the same as being safe, and is why this is reported.
   */
  baseline: bigint | null;
}

/** One perturbation, as a multiple of what the source reports now. */
export interface StressScenario {
  label: string;
  /**
   * What the source's answer is multiplied by.
   *
   * `Infinity` and `0` stand for the two unbounded ends and are realised as
   * the largest and smallest values the feed's own type can carry, which is as
   * infinite as a `int256` gets.
   */
  multiplier: number;
}

/**
 * What one feed answered under one scenario.
 *
 * `null` is a read that reverted, which is a different outcome from a wrong
 * number and is scored differently: a market whose oracle reverts cannot be
 * borrowed from or liquidated, where one that answers a wrong number can be
 * drained.
 **/
export interface FeedOutcome {
  feed: Address;
  /** What it answers now, with nothing overridden. */
  base: bigint | null;
  /** What it answers under the scenario. */
  stressed: bigint | null;
  /**
   * `stressed / base`, or `null` where either end could not be read.
   *
   * The headline number: 1 is a feed the group cannot move, and anything far
   * from it is a feed it can.
   */
  factor: number | null;
}

/**
 * What one market's slot looked like under one scenario.
 *
 * A slot and not a market: a token's main and reserve feeds are two slots, and
 * their disagreement is one of the things worth seeing.
 **/
export interface SlotOutcome {
  market: Address;
  marketName: string | null;
  curatorName: string | null;
  token: Address;
  tokenSymbol: string | null;
  reserve: boolean;
  isUnderlying: boolean;
  feed: FeedOutcome;
  /**
   * How the collateral's price moved against the market's own underlying.
   *
   * What a position is actually valued by: a market whose underlying and
   * collateral both doubled has not moved at all, and one where only the
   * collateral did has doubled every account's health. `null` where either
   * side could not be priced.
   */
  ratioFactor: number | null;
  /** What the market has quoted against the token, in USD at current prices. */
  quotaUsedUsd: number | null;
}

/**
 * What one group of sources does to one chain, under one scenario.
 **/
export interface GroupScenarioOutcome {
  scenario: StressScenario;
  slots: SlotOutcome[];
  /** Largest `ratioFactor` over the slots, and the smallest. */
  worstInflation: number | null;
  worstDeflation: number | null;
  /** Slots whose feed stopped answering, which it did answer before. */
  brokenSlots: number;
  /**
   * Slots whose feed does not answer even with nothing overridden.
   *
   * Not this group's doing and not a result of the sweep, but reported with
   * it: a slot priced through a feed that is reverting right now cannot be
   * made worse by anything, and a group that reaches only such slots would
   * otherwise score as harmless when what it really is, is moot.
   */
  deadSlots: number;
  /**
   * Quota in USD riding on the slots this scenario moved at all, over the
   * quota riding on every slot — how much of the chain the group reaches.
   */
  valueAtRisk: number;
}

/**
 * Where a group starts to matter, found by bisection on the multiplier.
 *
 * `null` means no multiplier in the searched range moved the market past the
 * threshold, which for a group that reaches nothing is the expected answer.
 **/
export interface BreakingPoint {
  market: Address;
  token: Address;
  /** Smallest upward multiple of the source that moves the ratio past 2×. */
  inflation: number | null;
  /** Largest downward multiple that moves it past ½×. */
  deflation: number | null;
}

/** What one group of sources can do to one chain. */
export interface GroupReport {
  chainId: number;
  group: string;
  sources: StressSource[];
  /** Whether every source in it was recognised rather than inferred. */
  identified: boolean;
  /** Market slots that read a feed built over any of its sources. */
  reachableSlots: number;
  /** Quota in USD riding on those slots, counted once per `(market, token)`. */
  reachableUsd: number;
  /**
   * Positions whose main feed and reserve feed both read something of this
   * group.
   *
   * A reserve feed exists so that a market has something to fall back on. One
   * that reads the same source as the feed it is backing up falls back onto
   * the same failure, and nothing about the pair says so — both are perfectly
   * healthy feeds from two different vendors with one number underneath.
   */
  undefendedPositions: number;
  outcomes: GroupScenarioOutcome[];
  breakingPoints: BreakingPoint[];
  /**
   * How many of its reachable slots answered differently under a perturbation
   * far too small for any bound to object to, over how many were reachable.
   *
   * The control. A group that moves nothing under the unbounded ends has
   * either been stopped by something — a bound, a sanity check, a second feed
   * — or was never really perturbed at all, and from the big scenarios alone
   * those two look identical. A slot that responds to a tenth of a percent is
   * a slot this test is genuinely driving; one that does not is a slot whose
   * every other result should be read as "unknown" rather than as "safe".
   */
  responsive: number;
  /**
   * Sources of the group that are not answering as it stands, so nothing
   * could be perturbed about them.
   */
  silentSources: number;
  /**
   * 0 to 10, where 10 is a group that can do nothing and 0 one that can
   * revalue the whole chain. See `score.ts` for what goes into it.
   */
  score: number;
  /** One line a reader can act on. */
  verdict: string;
}

/** Everything one run looked at. */
export interface StressReport {
  chainId: number;
  /** Slots read, before any grouping. */
  slots: number;
  /** Distinct feeds the markets read. */
  roots: number;
  /** Distinct nodes in all the oracles' trees. */
  nodes: number;
  /**
   * Slots whose feed does not answer at the current block, before anything is
   * perturbed — a standing fault rather than a finding of this test, and the
   * first thing to look at in its output.
   */
  deadSlots: number;
  sources: StressSource[];
  /**
   * Quota in USD this chain's markets have out, and the share of it priced
   * through at least one unidentified source.
   *
   * The second figure is the blind spot: value whose source could be named
   * only by its own description, so nothing says what else fails with it.
   */
  totalUsd: number;
  unidentifiedUsd: number;
  groups: GroupReport[];
}

/** Args of {@link PermissionlessOracles.stressTest}. */
export interface StressTestArgs {
  chainId: number;
  /**
   * Which perturbations to apply. Defaults to the two unbounded ends.
   */
  scenarios?: StressScenario[];
  /**
   * Also bisect for each market's breaking point, which costs a few more
   * calls per group. On by default.
   */
  thresholds?: boolean;
  /** Only these groups, for a second look at one of them. */
  groups?: string[];
}
