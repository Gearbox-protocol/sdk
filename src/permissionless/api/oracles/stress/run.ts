import {
  type Address,
  type Chain,
  formatUnits,
  hexToString,
  parseAbi,
  type PublicClient,
  type Transport,
} from "viem";
import { priceFeedCompressorAbi } from "../../../../abi/compressors/priceFeedCompressor.js";
import type { PermissionlessMarketSlot } from "../types.js";
import { classifySources, sourcesByFeed, type TreeNode } from "./classify.js";
import {
  groupOverride,
  UNBOUNDED_DOWN,
  UNBOUNDED_UP,
} from "./override.js";
import { scoreGroup, verdictOf } from "./score.js";
import type {
  BreakingPoint,
  FeedOutcome,
  GroupReport,
  GroupScenarioOutcome,
  SlotOutcome,
  StressReport,
  StressScenario,
  StressSource,
} from "./types.js";

/**
 * The two ends the question is asked at, which is what "infinitely large and
 * infinitely small" comes to once a type has to hold it.
 */
export const DEFAULT_SCENARIOS: StressScenario[] = [
  { label: "unbounded up", multiplier: UNBOUNDED_UP },
  { label: "unbounded down", multiplier: UNBOUNDED_DOWN },
];

const aggregatorAbi = parseAbi([
  "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)",
]);

/**
 * What a Gearbox LP feed exposes about the rate it reads.
 *
 * `lpContract` is the contract the rate comes off — the wstETH token, the
 * vault, the Curve pool — and is what a rate source is perturbed at.
 * The two bounds are the window the feed will accept a rate inside, which is
 * both this test's baseline and, as it turns out, most of its answer.
 */
const lpFeedAbi = parseAbi([
  "function lpContract() view returns (address)",
  "function lowerBound() view returns (uint256)",
  "function upperBound() view returns (uint256)",
]);

/**
 * The Gearbox LP feeds: a protocol's exchange rate, clamped to a window the
 * feed holds, times the price of what the rate is denominated in.
 */
export const RATE_FEED_TYPE =
  /::(ERC4626|CURVE_\w+|WSTETH|YEARN|MELLOW\w*|BALANCER\w*)$/;

/** The compressor's `bytes32` contract type, as the string it encodes. */
function typeName(raw: `0x${string}`): string {
  return hexToString(raw).replace(/\0+$/, "");
}

/** `price × amount` in USD, both of them as the chain reports them. */
function usd(amount: number | null, price: bigint | null): number | null {
  if (amount === null || price === null || price <= 0n) {
    return null;
  }
  return amount * Number(formatUnits(price, 8));
}

/**
 * The feed trees of every oracle the chain's markets use, flattened.
 *
 * One call per oracle and not per feed: the compressor answers an oracle's
 * entire tree at once, with every node's type, description, children and
 * current answer, which is the whole of what this test needs off the chain.
 * A node carried by several oracles is one node — the trees overlap heavily,
 * since the aggregators under them are the same handful.
 */
export async function readForest(
  client: PublicClient<Transport, Chain>,
  compressor: Address,
  oracles: Address[],
): Promise<{
  nodes: Map<Address, TreeNode>;
  answers: Map<Address, bigint | null>;
  unreadableOracles: Address[];
}> {
  const states = await client.multicall({
    contracts: oracles.map(oracle => ({
      address: compressor,
      abi: priceFeedCompressorAbi,
      functionName: "getPriceOracleState" as const,
      args: [oracle],
    })),
    allowFailure: true,
  });

  const nodes = new Map<Address, TreeNode>();
  const answers = new Map<Address, bigint | null>();
  const unreadableOracles: Address[] = [];

  states.forEach((state, i) => {
    if (state.status !== "success") {
      unreadableOracles.push(oracles[i] as Address);
      return;
    }

    const { priceFeedTree } = state.result as unknown as {
      priceFeedTree: ReadonlyArray<{
        baseParams: { addr: Address; version: bigint; contractType: `0x${string}` };
        description: string;
        underlyingFeeds: readonly Address[];
        answer: { price: bigint; success: boolean };
      }>;
    };

    for (const node of priceFeedTree) {
      const address = node.baseParams.addr.toLowerCase() as Address;
      if (nodes.has(address)) {
        continue;
      }
      nodes.set(address, {
        address,
        contractType: typeName(node.baseParams.contractType),
        version: Number(node.baseParams.version),
        description: node.description,
        underlyingFeeds: node.underlyingFeeds.map(
          feed => feed.toLowerCase() as Address,
        ),
      });
      answers.set(address, node.answer.success ? node.answer.price : null);
    }
  });

  return { nodes, answers, unreadableOracles };
}

/**
 * Where each rate-bearing feed reads its rate, and what it will accept.
 *
 * The baseline a rate source is perturbed from is the feed's own `lowerBound`
 * and not the rate itself. Reading the rate would mean knowing which getter
 * each protocol publishes it under — `stEthPerToken`, `convertToAssets`,
 * `get_virtual_price`, `pricePerShare` — and in exactly which units, which is
 * a table that goes stale. The bound is within the feed's own accepted window
 * of the live rate by construction, so it is the same figure to within that
 * window, which is two percent or so. That is immaterial against the
 * multipliers the ends of the sweep use, and at the fine end of the threshold
 * search the bound *is* the answer: an LP feed clamps the rate it accepts, so
 * where it breaks is where its bound is.
 */
export async function readRateTargets(
  client: PublicClient<Transport, Chain>,
  feeds: Address[],
): Promise<{
  targets: Map<Address, Address>;
  baselines: Map<Address, bigint>;
  bounds: Map<Address, { lower: bigint; upper: bigint }>;
}> {
  const targets = new Map<Address, Address>();
  const baselines = new Map<Address, bigint>();
  const bounds = new Map<Address, { lower: bigint; upper: bigint }>();

  if (feeds.length === 0) {
    return { targets, baselines, bounds };
  }

  const results = await client.multicall({
    contracts: feeds.flatMap(address => [
      { address, abi: lpFeedAbi, functionName: "lpContract" as const },
      { address, abi: lpFeedAbi, functionName: "lowerBound" as const },
      { address, abi: lpFeedAbi, functionName: "upperBound" as const },
    ]),
    allowFailure: true,
  });

  feeds.forEach((feed, i) => {
    const contract = results[3 * i];
    const lower = results[3 * i + 1];
    const upper = results[3 * i + 2];
    if (contract?.status !== "success" || lower?.status !== "success") {
      return;
    }
    const target = (contract.result as Address).toLowerCase() as Address;
    targets.set(feed, target);
    baselines.set(target, lower.result as bigint);
    if (upper?.status === "success") {
      bounds.set(feed, {
        lower: lower.result as bigint,
        upper: upper.result as bigint,
      });
    }
  });

  return { targets, baselines, bounds };
}

/**
 * What every feed answers with one group's sources overridden.
 *
 * One `eth_call` for the whole chain: the overrides go in once and the feeds
 * are read through a multicall inside them, so a group costs a round trip per
 * scenario rather than a round trip per feed. A feed that reverts comes back
 * `null`, which is an outcome and not an error.
 */
async function readUnder(
  client: PublicClient<Transport, Chain>,
  feeds: Address[],
  sources: StressSource[],
  multiplier: number,
  updatedAt: bigint,
): Promise<Map<Address, bigint | null>> {
  const overrides = groupOverride(sources, multiplier, updatedAt);

  const results = await client.multicall({
    contracts: feeds.map(address => ({
      address,
      abi: aggregatorAbi,
      functionName: "latestRoundData" as const,
    })),
    allowFailure: true,
    // An empty list is not an override, and some nodes reject it as one.
    stateOverride: overrides.length > 0 ? overrides : undefined,
  });

  return new Map(
    feeds.map((feed, i) => {
      const result = results[i];
      return [
        feed,
        result?.status === "success"
          ? ((result.result as readonly bigint[])[1] ?? null)
          : null,
      ];
    }),
  );
}

/**
 * A perturbation too small for any protection to be aimed at, which is what
 * makes it a control.
 *
 * A tenth of a percent is inside every bound these feeds carry and under every
 * deviation threshold, so a slot that does not budge under it is a slot the
 * override never reached — and every other figure about it is then unknown
 * rather than reassuring.
 */
const CALIBRATION_MULTIPLIER = 1.001;

/**
 * How many of a group's reachable slots actually responded to being driven.
 *
 * Exact inequality on the answer and not a factor: at a tenth of a percent the
 * point is only whether the number moved at all.
 */
async function countResponsive(
  client: PublicClient<Transport, Chain>,
  roots: Address[],
  slots: PermissionlessMarketSlot[],
  members: StressSource[],
  base: Map<Address, bigint | null>,
  updatedAt: bigint,
): Promise<number> {
  const nudged = await readUnder(
    client,
    roots,
    members,
    CALIBRATION_MULTIPLIER,
    updatedAt,
  );

  return slots.filter(slot => {
    const before = base.get(slot.priceFeed) ?? null;
    const after = nudged.get(slot.priceFeed) ?? null;
    return before !== after;
  }).length;
}

/** `stressed / base`, or `null` where either end is missing. */
function factorOf(base: bigint | null, stressed: bigint | null): number | null {
  if (base === null || stressed === null || base === 0n) {
    return null;
  }
  return Number(stressed) / Number(base);
}

/**
 * What a group did to one chain, market slot by market slot.
 *
 * The ratio and not the price: a slot is scored by how the collateral moved
 * against the market's own underlying, because that is what an account is
 * valued by. A group that moves both legs equally has moved nothing, and this
 * is where that shows up — the underlying's own feed is one of the feeds read
 * under the same override, so both legs come from the same call.
 */
function outcomeOf(
  scenario: StressScenario,
  slots: PermissionlessMarketSlot[],
  base: Map<Address, bigint | null>,
  stressed: Map<Address, bigint | null>,
  quotaUsd: Map<string, number | null>,
  chainTotalUsd: number,
): GroupScenarioOutcome {
  const movedPositions = new Set<string>();
  const out: SlotOutcome[] = slots.map(slot => {
    const feed: FeedOutcome = {
      feed: slot.priceFeed,
      base: base.get(slot.priceFeed) ?? null,
      stressed: stressed.get(slot.priceFeed) ?? null,
      factor: factorOf(
        base.get(slot.priceFeed) ?? null,
        stressed.get(slot.priceFeed) ?? null,
      ),
    };

    // The market's own underlying moves under the same override, so the two
    // legs are divided rather than the collateral's leg reported alone.
    const underlying = slot.underlyingPriceFeed;
    const underlyingFactor =
      underlying === null
        ? 1
        : (factorOf(
            base.get(underlying) ?? null,
            stressed.get(underlying) ?? null,
          ) ?? null);

    return {
      market: slot.market,
      marketName: slot.marketName,
      curatorName: slot.curatorName,
      token: slot.token,
      tokenSymbol: slot.tokenSymbol,
      reserve: slot.reserve,
      isUnderlying: slot.isUnderlying,
      feed,
      ratioFactor:
        feed.factor === null || underlyingFactor === null || underlyingFactor === 0
          ? null
          : feed.factor / underlyingFactor,
      quotaUsedUsd: quotaUsd.get(slotKey(slot)) ?? null,
    };
  });

  const ratios = out
    .map(slot => slot.ratioFactor)
    .filter((r): r is number => r !== null && Number.isFinite(r));

  // Counted per position, so a token whose two slots both moved is one
  // position's worth of money and not two.
  let movedUsd = 0;
  slots.forEach((slot, i) => {
    const outcome = out[i];
    const moved =
      outcome !== undefined &&
      ((outcome.ratioFactor !== null && outcome.ratioFactor !== 1) ||
        (outcome.feed.stressed === null && outcome.feed.base !== null));
    if (!moved || movedPositions.has(positionKey(slot))) {
      return;
    }
    movedPositions.add(positionKey(slot));
    movedUsd += outcome.quotaUsedUsd ?? 0;
  });

  return {
    scenario,
    slots: out,
    worstInflation: ratios.length > 0 ? Math.max(...ratios) : null,
    worstDeflation: ratios.length > 0 ? Math.min(...ratios) : null,
    brokenSlots: out.filter(
      slot => slot.feed.stressed === null && slot.feed.base !== null,
    ).length,
    deadSlots: out.filter(slot => slot.feed.base === null).length,
    valueAtRisk:
      chainTotalUsd > 0 ? movedUsd / chainTotalUsd : 0,
  };
}

/** What identifies a slot across the reads that describe it. */
function slotKey(slot: PermissionlessMarketSlot): string {
  return `${slot.market}:${slot.token}:${slot.reserve}`;
}

/**
 * What identifies the *position* a slot prices, which is not the slot.
 *
 * A quota belongs to a `(market, token)` pair, and that pair has two slots:
 * the main feed and the reserve one. Summing money over slots would count
 * every such pair twice, so anything denominated in money is summed over this
 * instead, and the slot figures stay per slot.
 */
function positionKey(slot: PermissionlessMarketSlot): string {
  return `${slot.market}:${slot.token}`;
}

/**
 * The quota riding on a set of slots, counted once per position.
 *
 * The sum a reader takes to be money at risk, so the double counting a
 * token's two slots would introduce is removed here rather than left for them
 * to notice.
 */
function quotaOver(
  slots: PermissionlessMarketSlot[],
  quotaUsd: Map<string, number | null>,
): number {
  const counted = new Set<string>();
  let total = 0;
  for (const slot of slots) {
    const key = positionKey(slot);
    if (counted.has(key)) {
      continue;
    }
    counted.add(key);
    total += quotaUsd.get(slotKey(slot)) ?? 0;
  }
  return total;
}

/**
 * The smallest multiple of a group's sources that moves some market past a
 * ratio of `target`, found by bisection.
 *
 * Eight steps over twelve orders of magnitude, which lands the answer inside a
 * factor of about ten percent — enough to say whether a source has to be
 * wrong by a percent or by a thousandfold before anything breaks, which is the
 * question. `null` is a group that does not get there at the far end either.
 */
async function bisect(
  read: (multiplier: number) => Promise<number>,
  from: number,
  to: number,
  target: (worst: number) => boolean,
  steps = 8,
): Promise<number | null> {
  if (!target(await read(to))) {
    return null;
  }

  let lo = from;
  let hi = to;
  for (let i = 0; i < steps; i++) {
    // Geometric, because the range spans orders of magnitude and the answer
    // is a multiplier: the midpoint of 1 and 1e12 is 1e6, not 5e11.
    const mid = Math.sqrt(lo * hi);
    if (target(await read(mid))) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return hi;
}

/**
 * Every source behind one chain's markets, put through the sweep a group at a
 * time.
 *
 * Takes the slots as read, so the caller decides whether that read came from
 * the backend or from somewhere else, and takes a client rather than making
 * one, so the whole thing is testable against a stub.
 **/
export async function runStressTest({
  client,
  chainId,
  slots,
  compressor,
  scenarios = DEFAULT_SCENARIOS,
  thresholds = true,
  groups: only,
  logger,
}: {
  client: PublicClient<Transport, Chain>;
  chainId: number;
  slots: PermissionlessMarketSlot[];
  compressor: Address;
  scenarios?: StressScenario[];
  thresholds?: boolean;
  groups?: string[];
  logger?: { warn(message: string): void; debug?(message: string): void };
}): Promise<StressReport> {
  const oracles = [
    ...new Set(slots.map(slot => slot.priceOracle.toLowerCase() as Address)),
  ];
  const { nodes, answers, unreadableOracles } = await readForest(
    client,
    compressor,
    oracles,
  );
  for (const oracle of unreadableOracles) {
    logger?.warn(
      `price oracle ${oracle} of chain ${chainId} would not report its feed tree; the markets on it are left out`,
    );
  }

  // Rate-bearing feeds are perturbed at the contract they read, which they
  // have to be asked for.
  const rateFeeds = [...nodes.values()]
    .filter(node => RATE_FEED_TYPE.test(node.contractType))
    .map(node => node.address);
  const { targets, baselines: rateBaselines } = await readRateTargets(
    client,
    rateFeeds,
  );

  // What each source answers now. A feed source's is what the compressor
  // already reported for it, so only the rate ones cost a read.
  const { sources, unresolved } = classifySources(
    chainId,
    [...nodes.values()],
    targets,
    target => rateBaselines.get(target) ?? answers.get(target) ?? null,
  );
  for (const node of unresolved) {
    logger?.warn(
      `feed ${node.address} of chain ${chainId} would not say what it reads its rate from; its protocol is left out of the partition`,
    );
  }

  // What the markets actually read, which is a fraction of the forest: the
  // roots, both roles, and each market's own underlying feed so that the two
  // legs of a ratio come out of the same call.
  const roots = [
    ...new Set([
      ...slots.map(slot => slot.priceFeed),
      ...slots
        .map(slot => slot.underlyingPriceFeed)
        .filter((feed): feed is Address => feed !== null),
    ]),
  ];

  const reach = sourcesByFeed(roots, nodes, sources);

  // Quota in USD per slot, priced with the feed the market prices its own
  // underlying with — the same conversion the asset pages do, off answers the
  // forest read already carries.
  const quotaUsd = new Map<string, number | null>();
  for (const slot of slots) {
    const price =
      slot.underlyingPriceFeed === null
        ? null
        : (answers.get(slot.underlyingPriceFeed) ?? null);
    quotaUsd.set(slotKey(slot), usd(slot.quotaUsed, price));
  }
  const totalUsd = quotaOver(slots, quotaUsd);

  // Kept fresh in every override: an oracle rejects an answer older than the
  // period it holds for the slot, and a revert from staleness would read as
  // the oracle having caught the manipulation when it caught nothing.
  const updatedAt = BigInt(Math.floor(Date.now() / 1000));

  // Read with nothing overridden rather than taken from the forest above: the
  // two would almost always agree, and a comparison is worth more when both
  // sides of it came through the same path.
  const base = await readUnder(client, roots, [], 1, updatedAt);
  const byGroup = new Map<string, StressSource[]>();
  for (const source of sources) {
    byGroup.set(source.group, [...(byGroup.get(source.group) ?? []), source]);
  }

  // Value priced through a source nothing claims a fate for, which is what a
  // reader should discount the rest of this report by.
  const unidentifiedUsd = quotaOver(
    slots.filter(slot => {
      const reached = reach.get(slot.priceFeed);
      return sources.some(
        source => !source.identified && reached?.has(source.target),
      );
    }),
    quotaUsd,
  );

  const reports: GroupReport[] = [];

  for (const [group, members] of byGroup) {
    if (only && !only.includes(group)) {
      continue;
    }

    const targetSet = new Set(members.map(source => source.target));
    const reachable = slots.filter(slot =>
      [...(reach.get(slot.priceFeed) ?? [])].some(source =>
        targetSet.has(source),
      ),
    );
    const reachableUsd = quotaOver(reachable, quotaUsd);

    // Positions whose main *and* reserve feed both read something of this
    // group: a fallback that fails with what it is falling back from is not
    // one, and this is the count a curator would want to see first.
    const roles = new Map<string, Set<boolean>>();
    for (const slot of reachable) {
      const key = positionKey(slot);
      roles.set(key, (roles.get(key) ?? new Set()).add(slot.reserve));
    }
    const undefendedPositions = [...roles.values()].filter(
      set => set.has(true) && set.has(false),
    ).length;

    const silentSources = members.filter(
      source => source.perturbable && source.baseline === null,
    ).length;
    const drivable = members.filter(
      source => source.perturbable && source.baseline !== null,
    );

    // Nothing to simulate: either no market reads anything built over the
    // group, or there is no source in it that can be made to lie — a constant
    // feed is not fed, and a silent one cannot be made to say something else.
    if (reachable.length === 0 || drivable.length === 0) {
      reports.push({
        chainId,
        group,
        sources: members,
        identified: members.every(source => source.identified),
        reachableSlots: reachable.length,
        reachableUsd,
        undefendedPositions,
        outcomes: [],
        breakingPoints: [],
        responsive: 0,
        silentSources,
        score: 10,
        verdict: verdictOf(
          group,
          10,
          [],
          reachable.length,
          reachableUsd,
          0,
          silentSources,
          undefendedPositions,
          members.some(source => !source.perturbable),
        ),
      });
      continue;
    }

    const outcomes: GroupScenarioOutcome[] = [];
    for (const scenario of scenarios) {
      const stressed = await readUnder(
        client,
        roots,
        members,
        scenario.multiplier,
        updatedAt,
      );
      outcomes.push(
        outcomeOf(scenario, reachable, base, stressed, quotaUsd, totalUsd),
      );
    }

    const breakingPoints: BreakingPoint[] = [];
    if (thresholds) {
      const worstRatio = async (multiplier: number): Promise<number> => {
        const stressed = await readUnder(
          client,
          roots,
          members,
          multiplier,
          updatedAt,
        );
        const outcome = outcomeOf(
          { label: "probe", multiplier },
          reachable,
          base,
          stressed,
          quotaUsd,
          totalUsd,
        );
        return Math.max(
          outcome.worstInflation ?? 1,
          1 / (outcome.worstDeflation ?? 1),
        );
      };

      const up = await bisect(worstRatio, 1, UNBOUNDED_UP, worst => worst >= 2);
      const down = await bisect(
        worstRatio,
        1,
        UNBOUNDED_DOWN,
        worst => worst >= 2,
      );

      // One pair for the group as a whole rather than per market: a per-market
      // threshold would be a bisection per market, which is a round trip per
      // market per step. The market the group reaches first is the one the
      // figure is about, and the outcomes above say which that is.
      breakingPoints.push({
        market: reachable[0]?.market ?? ("0x" as Address),
        token: reachable[0]?.token ?? ("0x" as Address),
        inflation: up,
        deflation: down,
      });
    }

    const responsive = await countResponsive(
      client,
      roots,
      reachable,
      members,
      base,
      updatedAt,
    );

    const score = scoreGroup(outcomes);
    reports.push({
      chainId,
      group,
      sources: members,
      identified: members.every(source => source.identified),
      reachableSlots: reachable.length,
      reachableUsd,
      undefendedPositions,
      outcomes,
      breakingPoints,
      responsive,
      silentSources,
      score,
      verdict: verdictOf(
        group,
        score,
        outcomes,
        reachable.length,
        reachableUsd,
        responsive,
        silentSources,
        undefendedPositions,
        false,
      ),
    });
  }

  return {
    chainId,
    slots: slots.length,
    roots: roots.length,
    nodes: nodes.size,
    deadSlots: slots.filter(slot => (base.get(slot.priceFeed) ?? null) === null)
      .length,
    sources,
    totalUsd,
    unidentifiedUsd,
    // Worst first, which is the order a reader wants: what can do the most
    // damage, and among equals what has the most riding on it.
    groups: reports.sort(
      (a, b) => a.score - b.score || b.reachableUsd - a.reachableUsd,
    ),
  };
}
