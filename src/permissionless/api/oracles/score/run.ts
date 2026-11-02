import {
  type Address,
  type Chain,
  formatUnits,
  type PublicClient,
  type Transport,
} from "viem";
import { classifySources, sourcesByFeed } from "../stress/classify.js";
import {
  RATE_FEED_TYPE,
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
import type { AssetScore, GroupImpact, MarketScore } from "./types.js";

const ZERO_TYPE = "PRICE_FEED::ZERO";

/** Groups simulated at once: one `eth_call` each, all against one node. */
const CONCURRENCY = 6;

/** A market's two slots for one token, and what the score makes of them. */
interface Position {
  main: PermissionlessMarketSlot;
  reserve: PermissionlessMarketSlot | undefined;
  /** The reserve the final price is taken against, if it is taken against one. */
  reserveFeed: Address | undefined;
  notes: string[];
}

const feedOf = (slot: PermissionlessMarketSlot) =>
  slot.priceFeed.toLowerCase() as Address;

/**
 * Every asset of one chain, scored by what each of its source groups can do
 * to the price its running markets hold for it.
 *
 * One read of the oracles' feed trees, one of the LP feeds' rate contracts,
 * one of every market feed as it stands — then one `eth_call` per source
 * group, with the group's sources overridden to answer
 * {@link SCORE_MULTIPLIER} times what they answer now and every market feed
 * read under it.
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
  logger?: { warn(message: string): void };
}): Promise<AssetScore[]> {
  // A shut down market prices nothing anyone can borrow against.
  const running = slots.filter(slot => !slot.isShutdown);

  const oracles = [
    ...new Set(running.map(slot => slot.priceOracle.toLowerCase() as Address)),
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

  // Main and reserve are two slots of one position.
  const slotsByPosition = new Map<
    string,
    { main?: PermissionlessMarketSlot; reserve?: PermissionlessMarketSlot }
  >();
  for (const slot of running) {
    const key = `${slot.market.toLowerCase()}:${slot.token.toLowerCase()}`;
    const entry = slotsByPosition.get(key) ?? {};
    entry[slot.reserve ? "reserve" : "main"] = slot;
    slotsByPosition.set(key, entry);
  }

  const positions: Position[] = [];
  for (const { main, reserve } of slotsByPosition.values()) {
    // A market's own underlying is left out: no market configures a reserve
    // for it, so scoring it would mark every underlying down for how markets
    // are built rather than for how the asset is curated.
    if (!main || main.isUnderlying) {
      continue;
    }
    const mainNode = nodes.get(feedOf(main));
    // Missing is an oracle that would not report its tree; a zero main feed
    // is a token switched off in the market, with no price left to guard.
    if (!mainNode || mainNode.contractType === ZERO_TYPE) {
      continue;
    }

    const notes: string[] = [];
    let reserveFeed: Address | undefined;
    if (!reserve) {
      notes.push("no reserve feed");
    } else if (nodes.get(feedOf(reserve))?.contractType === ZERO_TYPE) {
      notes.push("reserve is a ZeroPriceFeed");
    } else {
      reserveFeed = feedOf(reserve);
      if (reserveFeed === feedOf(main)) {
        notes.push("reserve is the main feed");
      }
    }
    positions.push({ main, reserve, reserveFeed, notes });
  }

  const priced = [
    ...new Set(
      positions.flatMap(({ main, reserveFeed }) =>
        reserveFeed ? [feedOf(main), reserveFeed] : [feedOf(main)],
      ),
    ),
  ];
  if (priced.length === 0) {
    return [];
  }
  // Each market's underlying is read under the same lie, so the collateral's
  // move can be put against the debt's.
  const underlyingOf = (slot: PermissionlessMarketSlot) =>
    slot.underlyingPriceFeed?.toLowerCase() as Address | undefined;
  const roots = [
    ...new Set([
      ...priced,
      ...positions
        .map(({ main }) => underlyingOf(main))
        .filter((feed): feed is Address => feed !== undefined),
    ]),
  ];

  // Kept fresh in every override: a feed rejects an answer older than its
  // staleness period, and that revert would read as the feed holding.
  const updatedAt = BigInt(Math.floor(Date.now() / 1000));

  // A constant feed has nothing publishing to it, and a silent one cannot be
  // made to say something else: neither is a source that can lie.
  const drivable = (source: StressSource | undefined): source is StressSource =>
    source !== undefined && source.perturbable && source.baseline !== null;
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
  for (const position of positions) {
    if (position.reserveFeed && (base.get(position.reserveFeed) ?? null) === null) {
      position.reserveFeed = undefined;
      position.notes.push("reserve does not answer");
    }
  }

  const reach = sourcesByFeed(roots, nodes, sources);
  const sourceByTarget = new Map(sources.map(source => [source.target, source]));

  const byGroup = new Map<string, StressSource[]>();
  for (const source of sources.filter(drivable)) {
    byGroup.set(source.group, [...(byGroup.get(source.group) ?? []), source]);
  }
  // Only what moves a collateral's own feeds: a lie about the underlying alone
  // is the underlying's to answer for.
  const reachedGroups = new Set<string>();
  for (const root of priced) {
    for (const target of reach.get(root) ?? []) {
      const source = sourceByTarget.get(target);
      if (drivable(source)) {
        reachedGroups.add(source.group);
      }
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

  const byAsset = new Map<
    Address,
    { symbol: string | null; markets: MarketScore[] }
  >();

  for (const { main, reserve, reserveFeed, notes } of positions) {
    const mainFeed = feedOf(main);
    const before = finalPrice(
      base.get(mainFeed) ?? null,
      reserveFeed ? (base.get(reserveFeed) ?? null) : undefined,
    );
    if (before === null || before <= 0n) {
      logger?.warn(
        `feed ${mainFeed} of chain ${chainId} does not answer; ${main.tokenSymbol ?? main.token} in ${main.marketName ?? main.market} is not scored`,
      );
      continue;
    }

    const onMain = groupsOf(mainFeed);
    const onReserve = groupsOf(reserveFeed);

    const impacts: GroupImpact[] = [...new Set([...onMain.keys(), ...onReserve.keys()])].map(
      group => {
        const under = stressed.get(group) ?? new Map<Address, bigint | null>();
        const after = finalPrice(
          under.get(mainFeed) ?? null,
          reserveFeed ? (under.get(reserveFeed) ?? null) : undefined,
        );
        const factor = factorOf(before, after);
        const underlying = underlyingOf(main);
        const debtBefore = underlying ? (base.get(underlying) ?? null) : null;
        const debtFactor =
          debtBefore === null || debtBefore <= 0n || !underlying
            ? null
            : factorOf(debtBefore, under.get(underlying) ?? null);
        const ratioFactor =
          factor === null || debtFactor === null || debtFactor === 0
            ? null
            : factor / debtFactor;
        const members = [...(onMain.get(group) ?? []), ...(onReserve.get(group) ?? [])];
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
          ratioFactor,
          score: scoreOfFactor(factor),
        };
      },
    );

    // Where one side holds against a lie only because the other reads a
    // source nothing could name, the hold rests on that source standing alone.
    const unverified =
      reserveFeed !== undefined &&
      impacts.some(impact => !impact.identified && impact.reaches !== "both");

    const side = (slot: PermissionlessMarketSlot) => ({
      feed: feedOf(slot),
      name: slot.priceFeedName,
      contractType: nodes.get(feedOf(slot))?.contractType ?? "",
      sources: [...groupsOf(feedOf(slot)).keys()],
    });

    const asset = main.token.toLowerCase() as Address;
    const entry = byAsset.get(asset) ?? { symbol: main.tokenSymbol, markets: [] };
    byAsset.set(asset, entry);

    entry.markets.push({
      market: main.market,
      marketName: main.marketName,
      marketConfigurator: main.marketConfigurator,
      curatorName: main.curatorName,
      main: side(main),
      reserve: reserve ? side(reserve) : null,
      hasReserve: reserveFeed !== undefined,
      price: Number(formatUnits(before, 8)),
      unverified,
      notes,
      ...worstOf(impacts),
    });
  }

  return [...byAsset].map(([asset, { symbol, markets }]) => {
    const sorted = markets.sort((a, b) => a.score - b.score);
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
