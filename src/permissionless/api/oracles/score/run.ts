import type { Address, Chain, PublicClient, Transport } from "viem";
import { classifySources, sourcesByFeed } from "../stress/classify.js";
import { RATE_FEED_TYPE, readForest, readRateTargets } from "../stress/run.js";
import type { StressSource } from "../stress/types.js";
import type { PermissionlessMarketSlot } from "../types.js";
import { type ScoreSource, scoreMarket } from "./formula.js";
import type { AssetScore, MarketScore } from "./types.js";

/**
 * How a source is told apart from another when two feeds are compared.
 *
 * A named source by its group, since two Chainlink aggregators are one
 * provider failing together. An unnamed one by its contract, since nothing
 * says what else it fails with — so the same contract on both sides is
 * shared, and two different ones are not.
 */
function toScoreSource(source: StressSource): ScoreSource {
  return {
    key: source.identified ? `group:${source.group}` : `contract:${source.target}`,
    name: source.group,
    identified: source.identified,
  };
}

/**
 * Every asset of one chain, scored by how its running markets price it.
 *
 * One read of every oracle's feed tree and one of the LP feeds' rate
 * contracts, both multicalls: the score is a reading of the trees and needs
 * no simulation.
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
  const { nodes, unreadableOracles } = await readForest(
    client,
    compressor,
    oracles,
  );
  for (const oracle of unreadableOracles) {
    logger?.warn(
      `price oracle ${oracle} of chain ${chainId} would not report its feed tree; the markets on it are not scored`,
    );
  }

  const { targets } = await readRateTargets(
    client,
    [...nodes.values()]
      .filter(node => RATE_FEED_TYPE.test(node.contractType))
      .map(node => node.address),
  );
  const { sources } = classifySources(
    chainId,
    [...nodes.values()],
    targets,
    () => null,
  );

  // A constant or zero feed carries its answer in its own code: nothing
  // publishes to it, so it is not a source two feeds could share.
  const byTarget = new Map(
    sources
      .filter(source => source.perturbable)
      .map(source => [source.target, toScoreSource(source)]),
  );

  const feedOf = (slot: PermissionlessMarketSlot) =>
    slot.priceFeed.toLowerCase() as Address;
  const reach = sourcesByFeed(
    [...new Set(running.map(feedOf))],
    nodes,
    sources,
  );
  const sourcesOf = (feed: Address): ScoreSource[] =>
    [...(reach.get(feed) ?? [])]
      .map(target => byTarget.get(target))
      .filter((source): source is ScoreSource => source !== undefined);

  // Main and reserve are two slots of one position.
  const positions = new Map<
    string,
    { main?: PermissionlessMarketSlot; reserve?: PermissionlessMarketSlot }
  >();
  for (const slot of running) {
    const key = `${slot.market.toLowerCase()}:${slot.token.toLowerCase()}`;
    const position = positions.get(key) ?? {};
    position[slot.reserve ? "reserve" : "main"] = slot;
    positions.set(key, position);
  }

  const byAsset = new Map<
    Address,
    { symbol: string | null; markets: MarketScore[] }
  >();

  for (const { main, reserve } of positions.values()) {
    // A market's own underlying is left out: no market configures a reserve
    // for it, so scoring it would mark every underlying down for how markets
    // are built rather than for how the asset is curated.
    if (!main || main.isUnderlying) {
      continue;
    }
    const asset = main.token.toLowerCase() as Address;
    const entry = byAsset.get(asset) ?? {
      symbol: main.tokenSymbol,
      markets: [],
    };
    byAsset.set(asset, entry);

    const mainNode = nodes.get(feedOf(main));
    if (!mainNode) {
      // Its oracle would not report the tree, and a feed of unknown type
      // cannot be said to be bounded or not.
      continue;
    }
    // A token whose main feed answers zero is switched off in the market: it
    // is worth nothing as collateral, so there is no price to guard.
    if (mainNode.contractType === "PRICE_FEED::ZERO") {
      continue;
    }

    const side = (slot: PermissionlessMarketSlot) => ({
      feed: {
        feed: feedOf(slot),
        name: slot.priceFeedName,
        contractType: nodes.get(feedOf(slot))?.contractType ?? "",
      },
      sources: sourcesOf(feedOf(slot)),
    });

    entry.markets.push(
      scoreMarket(
        {
          market: main.market,
          marketName: main.marketName,
          marketConfigurator: main.marketConfigurator,
          curatorName: main.curatorName,
        },
        side(main),
        reserve ? side(reserve) : null,
      ),
    );
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
