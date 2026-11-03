import {
  type Address,
  type Chain,
  formatUnits,
  type PublicClient,
  type Transport,
} from "viem";
import {
  classifySources,
  sourcesByFeed,
  type TreeNode,
} from "../stress/classify.js";
import {
  RATE_FEED_TYPE,
  readFeedTrees,
  readForest,
  readRateTargets,
  readUnder,
} from "../stress/run.js";
import type { StressSource } from "../stress/types.js";
import type { PermissionlessMarketSlot } from "../types.js";
import {
  factorOf,
  finalPrice,
  SCORE_MULTIPLIER,
  scoreOfFactor,
  worstOf,
} from "./formula.js";
import type {
  AssetScore,
  FeedPairScore,
  GroupImpact,
  MarketScore,
  ScoredFeed,
} from "./types.js";

const ZERO_TYPE = "PRICE_FEED::ZERO";

/** Groups simulated at once: one `eth_call` each, all against one node. */
const CONCURRENCY = 6;

/** A main feed and the reserve its price is taken against, if any. */
interface Pair {
  main: Address;
  /** The reserve the final price is taken against, if it is taken against one. */
  reserve: Address | undefined;
  notes: string[];
}

/** What a pair scores, short of naming its feeds. */
type Simulated = Omit<FeedPairScore, "main" | "reserve">;

type Logger = { warn(message: string): void };

const lower = (address: Address) => address.toLowerCase() as Address;

/**
 * A main feed and the reserve a slot or a caller names for it, as the score
 * takes them: a reserve that is a `ZeroPriceFeed` is no reserve.
 */
function pairOf(
  main: Address,
  reserve: Address | undefined,
  nodes: Map<Address, TreeNode>,
): Pair {
  const notes: string[] = [];
  if (!reserve) {
    notes.push("no reserve feed");
    return { main, reserve: undefined, notes };
  }
  if (nodes.get(reserve)?.contractType === ZERO_TYPE) {
    notes.push("reserve is a ZeroPriceFeed");
    return { main, reserve: undefined, notes };
  }
  if (reserve === main) {
    notes.push("reserve is the main feed");
  }
  return { main, reserve, notes };
}

/**
 * Every pair's final price under each source group lying, from one read of
 * the LP feeds' rate contracts, one of every feed as it stands, and then one
 * `eth_call` per source group with the group's sources overridden to answer
 * {@link SCORE_MULTIPLIER} times what they answer now.
 *
 * A pair whose final price does not answer as it stands comes back `null`:
 * there is no price to move.
 */
async function simulatePairs({
  client,
  chainId,
  nodes,
  answers,
  pairs,
  logger,
}: {
  client: PublicClient<Transport, Chain>;
  chainId: number;
  nodes: Map<Address, TreeNode>;
  answers: Map<Address, bigint | null>;
  pairs: Pair[];
  logger?: Logger;
}): Promise<{
  results: (Simulated | null)[];
  sourcesOf: (feed: Address) => string[];
}> {
  const { targets, baselines: rateBaselines } = await readRateTargets(
    client,
    [...nodes.values()]
      .filter(node => RATE_FEED_TYPE.test(node.contractType))
      .map(node => node.address),
  );
  const { sources, unresolved } = classifySources(
    chainId,
    [...nodes.values()],
    targets,
    target => rateBaselines.get(target) ?? answers.get(target) ?? null,
  );
  for (const node of unresolved) {
    logger?.warn(
      `feed ${node.address} of chain ${chainId} would not say what it reads its rate from; its protocol is not perturbed`,
    );
  }

  const roots = [
    ...new Set(
      pairs.flatMap(({ main, reserve }) => (reserve ? [main, reserve] : [main])),
    ),
  ];
  const reach = sourcesByFeed(roots, nodes, sources);
  const sourceByTarget = new Map(sources.map(source => [source.target, source]));

  // A constant feed has nothing publishing to it, and a silent one cannot be
  // made to say something else: neither is a source that can lie.
  const drivable = (source: StressSource | undefined): source is StressSource =>
    source !== undefined && source.perturbable && source.baseline !== null;

  const groupsOf = (feed: Address | undefined): Map<string, StressSource[]> => {
    const out = new Map<string, StressSource[]>();
    for (const target of feed ? (reach.get(feed) ?? []) : []) {
      const source = sourceByTarget.get(target);
      if (drivable(source)) {
        out.set(source.group, [...(out.get(source.group) ?? []), source]);
      }
    }
    return out;
  };
  const sourcesOf = (feed: Address) => [...groupsOf(feed).keys()];

  if (roots.length === 0) {
    return { results: [], sourcesOf };
  }

  // Kept fresh in every override: a feed rejects an answer older than its
  // staleness period, and that revert would read as the feed holding.
  const updatedAt = BigInt(Math.floor(Date.now() / 1000));

  // A root that does not answer as it stands is read again with every price
  // feed source re-answering what it answers now under a fresh timestamp: a
  // pull feed nobody has pushed to lately is stale, and the feed over it
  // reverts before it prices. Only those roots, because the stub answering in
  // a source's place is selector-blind, and a few feeds read their sources
  // through more than the round data. Rate sources are left alone: a rate
  // does not go stale, and their baseline is the feed's lower bound rather
  // than the rate itself.
  const fresh = sources.filter(
    source => drivable(source) && source.kind === "feed",
  );
  const asIs = await readUnder(client, roots, [], 1, updatedAt);
  const stale = roots.filter(root => (asIs.get(root) ?? null) === null);
  const freshened =
    stale.length > 0
      ? await readUnder(client, stale, [], 1, updatedAt, fresh)
      : new Map<Address, bigint | null>();
  const base = new Map(
    roots.map(root => [root, asIs.get(root) ?? freshened.get(root) ?? null]),
  );
  const asIsRoots = roots.filter(root => (asIs.get(root) ?? null) !== null);
  const freshRoots = stale.filter(root => (freshened.get(root) ?? null) !== null);

  /** Every root under a lie, each read the way its base was. */
  const readLying = async (
    members: StressSource[],
  ): Promise<Map<Address, bigint | null>> => {
    const [plain, refreshed] = await Promise.all([
      asIsRoots.length > 0
        ? readUnder(client, asIsRoots, members, SCORE_MULTIPLIER, updatedAt)
        : new Map<Address, bigint | null>(),
      freshRoots.length > 0
        ? readUnder(
            client,
            freshRoots,
            members,
            SCORE_MULTIPLIER,
            updatedAt,
            fresh,
          )
        : new Map<Address, bigint | null>(),
    ]);
    return new Map([...plain, ...refreshed]);
  };

  // A reserve that does not answer now is not one the price can fall back on.
  const effective = pairs.map(pair =>
    pair.reserve && (base.get(pair.reserve) ?? null) === null
      ? {
          ...pair,
          reserve: undefined,
          notes: [...pair.notes, "reserve does not answer"],
        }
      : pair,
  );

  const byGroup = new Map<string, StressSource[]>();
  for (const source of sources.filter(drivable)) {
    byGroup.set(source.group, [...(byGroup.get(source.group) ?? []), source]);
  }
  const reachedGroups = new Set<string>();
  for (const root of roots) {
    for (const group of groupsOf(root).keys()) {
      reachedGroups.add(group);
    }
  }

  const stressed = new Map<string, Map<Address, bigint | null>>();
  const queue = [...reachedGroups];
  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    await Promise.all(
      queue.slice(i, i + CONCURRENCY).map(async group => {
        stressed.set(group, await readLying(byGroup.get(group) ?? []));
      }),
    );
  }

  const results = effective.map(({ main, reserve, notes }): Simulated | null => {
    const before = finalPrice(
      base.get(main) ?? null,
      reserve ? (base.get(reserve) ?? null) : undefined,
    );
    if (before === null || before <= 0n) {
      return null;
    }

    const onMain = groupsOf(main);
    const onReserve = groupsOf(reserve);

    const impacts: GroupImpact[] = [
      ...new Set([...onMain.keys(), ...onReserve.keys()]),
    ].map(group => {
      const under = stressed.get(group) ?? new Map<Address, bigint | null>();
      const after = finalPrice(
        under.get(main) ?? null,
        reserve ? (under.get(reserve) ?? null) : undefined,
      );
      const factor = factorOf(before, after);
      const members = [
        ...(onMain.get(group) ?? []),
        ...(onReserve.get(group) ?? []),
      ];
      return {
        group,
        identified: members.every(source => source.identified),
        feeds: [...new Set(members.map(source => source.description))],
        reaches: onMain.has(group)
          ? onReserve.has(group)
            ? "both"
            : "main"
          : "reserve",
        factor,
        score: scoreOfFactor(factor),
      };
    });

    return {
      hasReserve: reserve !== undefined,
      price: Number(formatUnits(before, 8)),
      // Where one side holds against a lie only because the other reads a
      // source nothing could name, the hold rests on that source standing
      // alone.
      unverified:
        reserve !== undefined &&
        impacts.some(impact => !impact.identified && impact.reaches !== "both"),
      notes,
      ...worstOf(impacts),
    };
  });

  return { results, sourcesOf };
}

/**
 * Every asset of one chain, scored by what each of its source groups can do
 * to the price its running markets hold for it.
 *
 * One read of the oracles' feed trees, then the simulation of every market's
 * main and reserve pair at once — see {@link simulatePairs}.
 **/
export async function runAssetScores({
  client,
  chainId,
  slots,
  compressor,
  logger,
}: {
  client: PublicClient<Transport, Chain>;
  chainId: number;
  slots: PermissionlessMarketSlot[];
  compressor: Address;
  logger?: Logger;
}): Promise<AssetScore[]> {
  // A shut down market prices nothing anyone can borrow against.
  const running = slots.filter(slot => !slot.isShutdown);

  const oracles = [
    ...new Set(running.map(slot => lower(slot.priceOracle))),
  ];
  const { nodes, answers, unreadableOracles } = await readForest(
    client,
    compressor,
    oracles,
  );
  for (const oracle of unreadableOracles) {
    logger?.warn(
      `price oracle ${oracle} of chain ${chainId} would not report its feed tree; the markets on it are not scored`,
    );
  }

  // Main and reserve are two slots of one position.
  const slotsByPosition = new Map<
    string,
    { main?: PermissionlessMarketSlot; reserve?: PermissionlessMarketSlot }
  >();
  for (const slot of running) {
    const key = `${lower(slot.market)}:${lower(slot.token)}`;
    const entry = slotsByPosition.get(key) ?? {};
    entry[slot.reserve ? "reserve" : "main"] = slot;
    slotsByPosition.set(key, entry);
  }

  const positions: {
    main: PermissionlessMarketSlot;
    reserve: PermissionlessMarketSlot | undefined;
  }[] = [];
  for (const { main, reserve } of slotsByPosition.values()) {
    if (!main) {
      continue;
    }
    const mainNode = nodes.get(lower(main.priceFeed));
    // Missing is an oracle that would not report its tree; a zero main feed
    // is a token switched off in the market, with no price left to guard.
    if (!mainNode || mainNode.contractType === ZERO_TYPE) {
      continue;
    }
    positions.push({ main, reserve });
  }

  const { results, sourcesOf } = await simulatePairs({
    client,
    chainId,
    nodes,
    answers,
    pairs: positions.map(({ main, reserve }) =>
      pairOf(
        lower(main.priceFeed),
        reserve ? lower(reserve.priceFeed) : undefined,
        nodes,
      ),
    ),
    logger,
  });

  const side = (slot: PermissionlessMarketSlot): ScoredFeed => ({
    feed: lower(slot.priceFeed),
    name: slot.priceFeedName,
    contractType: nodes.get(lower(slot.priceFeed))?.contractType ?? "",
    sources: sourcesOf(lower(slot.priceFeed)),
  });

  const byAsset = new Map<
    Address,
    { symbol: string | null; markets: MarketScore[] }
  >();

  positions.forEach(({ main, reserve }, i) => {
    const result = results[i];
    if (!result) {
      logger?.warn(
        `feed ${lower(main.priceFeed)} of chain ${chainId} does not answer; ${main.tokenSymbol ?? main.token} in ${main.marketName ?? main.market} is not scored`,
      );
      return;
    }

    const asset = lower(main.token);
    const entry = byAsset.get(asset) ?? { symbol: main.tokenSymbol, markets: [] };
    byAsset.set(asset, entry);

    entry.markets.push({
      market: main.market,
      marketName: main.marketName,
      marketConfigurator: main.marketConfigurator,
      curatorName: main.curatorName,
      main: side(main),
      reserve: reserve ? side(reserve) : null,
      ...result,
    });
  });

  return [...byAsset].map(([asset, { symbol, markets }]) => {
    const sorted = markets.sort((a, b) => b.score - a.score);
    const worst = sorted[0] ?? null;
    return {
      chainId,
      asset,
      symbol,
      score: worst?.score ?? null,
      unverified: sorted.some(market => market.unverified),
      worst,
      markets: sorted,
    };
  });
}

/**
 * Any main feed and reserve on a chain, scored the way a market holding them
 * would be — whether or not any market does yet.
 *
 * The two trees are read off the compressor by feed rather than by oracle,
 * so a feed the curator has only just deployed scores as well as one in use.
 *
 * @throws Where there is nothing to score: the compressor cannot read a
 * feed, the main feed is a `ZeroPriceFeed`, or the final price does not
 * answer even with every pull feed under it freshened.
 **/
export async function runFeedPairScore({
  client,
  chainId,
  compressor,
  main,
  reserve,
  logger,
}: {
  client: PublicClient<Transport, Chain>;
  chainId: number;
  compressor: Address;
  main: Address;
  reserve?: Address;
  logger?: Logger;
}): Promise<FeedPairScore> {
  const mainFeed = lower(main);
  const reserveFeed = reserve ? lower(reserve) : undefined;

  const feeds =
    reserveFeed && reserveFeed !== mainFeed ? [mainFeed, reserveFeed] : [mainFeed];
  const { nodes, answers } = await readFeedTrees(client, compressor, feeds).catch(
    (cause: unknown) => {
      throw new Error(
        `the PriceFeedCompressor of chain ${chainId} would not read ${feeds.join(" and ")}: not a price feed it knows`,
        { cause },
      );
    },
  );
  for (const feed of [mainFeed, reserveFeed]) {
    if (feed && !nodes.has(feed)) {
      throw new Error(
        `feed ${feed} of chain ${chainId} is not one the PriceFeedCompressor can read`,
      );
    }
  }
  if (nodes.get(mainFeed)?.contractType === ZERO_TYPE) {
    throw new Error(
      `the main feed ${mainFeed} is a ZeroPriceFeed: it prices nothing, so nothing can move`,
    );
  }

  const { results, sourcesOf } = await simulatePairs({
    client,
    chainId,
    nodes,
    answers,
    pairs: [pairOf(mainFeed, reserveFeed, nodes)],
    logger,
  });
  const result = results[0];
  if (!result) {
    throw new Error(
      `the main feed ${mainFeed} of chain ${chainId} does not answer, so there is no price to move`,
    );
  }

  const side = (feed: Address): ScoredFeed => ({
    feed,
    name: null,
    contractType: nodes.get(feed)?.contractType ?? "",
    sources: sourcesOf(feed),
  });

  return {
    main: side(mainFeed),
    reserve: reserveFeed ? side(reserveFeed) : null,
    ...result,
  };
}
