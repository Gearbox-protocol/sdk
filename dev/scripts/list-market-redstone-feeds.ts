import { pino } from "pino";
import type { Address } from "viem";
import { getAlchemyUrl } from "../../src/dev/providers.js";
import {
  formatBN,
  getCuratorName,
  type IPriceFeedContract,
  type MarketSuite,
  MultichainSDK,
  type NetworkType,
  type OnchainSDK,
  type PriceFeedRef,
  type RedstonePriceFeedContract,
} from "../../src/onchain/index.js";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    bindings: () => ({}),
    level: label => ({ level: label }),
  },
});

/** Which of the two oracle feed maps a token is priced through. */
type FeedRole = "main" | "reserve";

/** One path from a token's top-level oracle feed down to a redstone feed. */
interface RedstoneDependencyPath {
  role: FeedRole;
  token: Address;
  symbol: string;
  /** Feeds between the oracle root and the redstone feed, root first (empty if redstone is the root). */
  dependents: IPriceFeedContract[];
  /** Quoted amount of `token` in this market, in USD with 8 decimals. */
  quotedUSD: bigint;
}

/** All ways a single redstone feed contract is reached inside one market. */
interface RedstoneUsage {
  feed: RedstonePriceFeedContract;
  paths: RedstoneDependencyPath[];
  /** Sum over distinct tokens reaching this feed through a main path. */
  mainQuotedUSD: bigint;
  /** Same, through a reserve path. */
  reserveQuotedUSD: bigint;
  /** Tokens already counted, per role, so multiple paths to the same feed do not double count. */
  countedTokens: Record<FeedRole, Set<Address>>;
}

interface MarketRedstoneReport {
  network: NetworkType;
  configurator: Address;
  curator: string;
  poolName: string;
  pool: Address;
  underlyingSymbol: string;
  /** Keyed by redstone feed address. */
  usages: Map<Address, RedstoneUsage>;
  /** Quoted amounts of tokens with redstone in their main / reserve feed tree. */
  mainQuotedUSD: bigint;
  reserveQuotedUSD: bigint;
}

interface NetworkSummary {
  marketsWithRedstone: number;
  marketsWithoutRedstone: number;
  feeds: Set<Address>;
  mainQuotedUSD: bigint;
  reserveQuotedUSD: bigint;
}

/** A redstone feed found in a feed tree, together with the feeds that depend on it. */
interface RedstonePathHit {
  feed: RedstonePriceFeedContract;
  dependents: IPriceFeedContract[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} env variable is not set`);
  }
  return value;
}

function alchemy(network: NetworkType): string {
  const url = getAlchemyUrl(network, requireEnv("ALCHEMY_KEY"));
  if (!url) {
    throw new Error(`no alchemy url for ${network}`);
  }
  return url;
}

function isRedstone(
  feed: IPriceFeedContract,
): feed is RedstonePriceFeedContract {
  return feed.priceFeedType === "PRICE_FEED::REDSTONE";
}

/**
 * Quoted amount in USD (8 decimals) of a token in a market, or undefined if
 * nothing is quoted or the price is unavailable.
 */
function quotedUSD(
  chainSdk: OnchainSDK,
  market: MarketSuite,
  token: Address,
): bigint | undefined {
  const { priceOracle: o, pool: p } = market;
  const totalQuoted = p.pqk.quotas.get(token)?.totalQuoted ?? 0n;
  if (totalQuoted === 0n) {
    return undefined;
  }
  try {
    return o.convertToUSD(p.underlying, totalQuoted);
  } catch {
    try {
      return o.convertToUSD(p.underlying, totalQuoted, true);
    } catch (e) {
      logger.error(
        `error converting ${chainSdk.labelAddress(p.underlying)} quota to USD: ${e}`,
      );
      return undefined;
    }
  }
}

/**
 * Walks a price feed tree top-down and returns every redstone feed in it with
 * the chain of feeds that depend on it, root first.
 */
function collectRedstonePaths(root: IPriceFeedContract): RedstonePathHit[] {
  const hits: RedstonePathHit[] = [];

  const walk = (
    feed: IPriceFeedContract,
    dependents: IPriceFeedContract[],
    seen: Set<Address>,
  ): void => {
    if (isRedstone(feed)) {
      hits.push({ feed, dependents });
      return;
    }
    if (seen.has(feed.address)) {
      return;
    }
    let underlying: readonly PriceFeedRef[];
    try {
      underlying = feed.underlyingPriceFeeds;
    } catch (e) {
      logger.debug(`cannot read underlying feeds of ${feed.address}: ${e}`);
      return;
    }
    // a feed can list the same child twice, e.g. a curve stable feed whose pool
    // coins share one price feed - such an edge is only worth reporting once
    const children = new Map<Address, PriceFeedRef>();
    for (const ref of underlying) {
      if (!children.has(ref.address)) {
        children.set(ref.address, ref);
      }
    }
    for (const ref of children.values()) {
      let child: IPriceFeedContract;
      try {
        child = ref.priceFeed;
      } catch (e) {
        logger.debug(`cannot resolve price feed ${ref.address}: ${e}`);
        continue;
      }
      walk(child, [...dependents, feed], new Set(seen).add(feed.address));
    }
  };

  walk(root, [], new Set());
  return hits;
}

function usage(
  report: MarketRedstoneReport,
  feed: RedstonePriceFeedContract,
): RedstoneUsage {
  let u = report.usages.get(feed.address);
  if (!u) {
    u = {
      feed,
      paths: [],
      mainQuotedUSD: 0n,
      reserveQuotedUSD: 0n,
      countedTokens: { main: new Set(), reserve: new Set() },
    };
    report.usages.set(feed.address, u);
  }
  return u;
}

function marketReport(
  network: NetworkType,
  chainSdk: OnchainSDK,
  market: MarketSuite,
): MarketRedstoneReport {
  const report: MarketRedstoneReport = {
    network,
    configurator: market.configurator.address,
    curator: getCuratorName(market.configurator.address, network) ?? "unknown",
    poolName: market.state.pool.name,
    pool: market.pool.pool.address,
    underlyingSymbol:
      chainSdk.tokensMeta.get(market.underlying)?.symbol ?? market.underlying,
    usages: new Map(),
    mainQuotedUSD: 0n,
    reserveQuotedUSD: 0n,
  };

  const byRole: Array<[FeedRole, Array<[Address, PriceFeedRef]>]> = [
    ["main", market.priceOracle.mainPriceFeeds.entries()],
    ["reserve", market.priceOracle.reservePriceFeeds.entries()],
  ];

  for (const [role, entries] of byRole) {
    // oracle maps are keyed by token, so each token is visited once per role
    for (const [token, ref] of entries) {
      let root: IPriceFeedContract;
      try {
        root = ref.priceFeed;
      } catch (e) {
        logger.debug(`cannot resolve price feed ${ref.address}: ${e}`);
        continue;
      }
      const hits = collectRedstonePaths(root);
      if (hits.length === 0) {
        continue;
      }
      const quoted = quotedUSD(chainSdk, market, token) ?? 0n;
      const symbol = chainSdk.tokensMeta.get(token)?.symbol ?? token;
      if (role === "main") {
        report.mainQuotedUSD += quoted;
      } else {
        report.reserveQuotedUSD += quoted;
      }
      for (const hit of hits) {
        const u = usage(report, hit.feed);
        u.paths.push({
          role,
          token,
          symbol,
          dependents: hit.dependents,
          quotedUSD: quoted,
        });
        if (!u.countedTokens[role].has(token)) {
          u.countedTokens[role].add(token);
          if (role === "main") {
            u.mainQuotedUSD += quoted;
          } else {
            u.reserveQuotedUSD += quoted;
          }
        }
      }
    }
  }

  return report;
}

function printReport(report: MarketRedstoneReport): void {
  console.log(
    `\n=== ${report.network} | ${report.curator} (${report.configurator}) ===`,
  );
  console.log(
    `pool ${report.poolName} (${report.pool}) underlying ${report.underlyingSymbol}`,
  );
  console.log(
    `quoted via redstone: main ${usd(report.mainQuotedUSD)} | reserve ${usd(report.reserveQuotedUSD)} (per-token, may be less than the sum over feeds below)`,
  );

  const usages = [...report.usages.values()].sort(
    (a, b) =>
      cmp(b.mainQuotedUSD, a.mainQuotedUSD) ||
      cmp(b.reserveQuotedUSD, a.reserveQuotedUSD) ||
      a.feed.address.localeCompare(b.feed.address),
  );

  for (const u of usages) {
    console.log(`  redstone ${u.feed.address} [${u.feed.name}]`);
    console.log(
      `    quoted: main ${usd(u.mainQuotedUSD)} | reserve ${usd(u.reserveQuotedUSD)}`,
    );
    const paths = u.paths.sort(
      (a, b) =>
        a.role.localeCompare(b.role) ||
        cmp(b.quotedUSD, a.quotedUSD) ||
        a.symbol.localeCompare(b.symbol),
    );
    const symbolWidth = Math.max(...paths.map(p => p.symbol.length));
    for (const p of paths) {
      const via =
        p.dependents.length === 0
          ? "direct"
          : `via ${p.dependents.map(d => `${d.address} [${d.name}]`).join(", ")}`;
      console.log(
        `    ${p.role.padEnd(7)} ${p.symbol.padEnd(symbolWidth)} (${p.token}) ${usd(p.quotedUSD)} ${via}`,
      );
    }
  }
}

function summarize(reports: MarketRedstoneReport[]): void {
  const byNetwork = new Map<NetworkType, NetworkSummary>();
  for (const r of reports) {
    let s = byNetwork.get(r.network);
    if (!s) {
      s = {
        marketsWithRedstone: 0,
        marketsWithoutRedstone: 0,
        feeds: new Set(),
        mainQuotedUSD: 0n,
        reserveQuotedUSD: 0n,
      };
      byNetwork.set(r.network, s);
    }
    if (r.usages.size === 0) {
      s.marketsWithoutRedstone += 1;
      continue;
    }
    s.marketsWithRedstone += 1;
    for (const address of r.usages.keys()) {
      s.feeds.add(address);
    }
    s.mainQuotedUSD += r.mainQuotedUSD;
    s.reserveQuotedUSD += r.reserveQuotedUSD;
  }

  console.log("\n=== Summary ===");
  let markets = 0;
  let skipped = 0;
  let feeds = 0;
  let main = 0n;
  let reserve = 0n;
  for (const [network, s] of byNetwork) {
    markets += s.marketsWithRedstone;
    skipped += s.marketsWithoutRedstone;
    feeds += s.feeds.size;
    main += s.mainQuotedUSD;
    reserve += s.reserveQuotedUSD;
    console.log(
      `${network}: ${s.marketsWithRedstone} markets using redstone (${s.marketsWithoutRedstone} without), ${s.feeds.size} redstone feeds, quoted main ${usd(s.mainQuotedUSD)} | reserve ${usd(s.reserveQuotedUSD)}`,
    );
  }
  console.log(
    `Total: ${markets} markets using redstone (${skipped} without), ${feeds} redstone feeds, quoted main ${usd(main)} | reserve ${usd(reserve)}`,
  );
}

async function listMarketRedstoneFeeds(): Promise<void> {
  const networks: Partial<Record<NetworkType, string>> = {
    Mainnet: alchemy("Mainnet"),
    Plasma: alchemy("Plasma"),
    Monad: alchemy("Monad"),
    Somnia: requireEnv("SOMNIA_PROVIDER"),
    Etherlink: requireEnv("ETHERLINK_PROVIDER"),
  };

  const sdk = new MultichainSDK({
    chains: Object.fromEntries(
      Object.entries(networks).map(([network, url]) => [
        network,
        { rpcURLs: [url], timeout: 480_000 },
      ]),
    ),
    logger,
  });
  // prices must be loaded: quoted amounts go through priceOracle.convertToUSD
  await sdk.attach();

  const reports: MarketRedstoneReport[] = [];
  for (const [network, chainSdk] of sdk.chains) {
    for (const market of chainSdk.marketRegister.markets) {
      reports.push(marketReport(network, chainSdk, market));
    }
  }

  const sorted = reports.sort(
    (a, b) =>
      a.network.localeCompare(b.network) ||
      cmp(b.mainQuotedUSD, a.mainQuotedUSD) ||
      cmp(b.reserveQuotedUSD, a.reserveQuotedUSD) ||
      a.poolName.localeCompare(b.poolName),
  );

  console.log("\n=== Redstone price feeds per market ===");
  for (const report of sorted) {
    if (report.usages.size === 0) {
      continue;
    }
    printReport(report);
  }

  summarize(sorted);
}

function cmp(a: bigint, b: bigint): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function usd(value: bigint): string {
  return `${formatBN(value, 8, 2)} USD`;
}

listMarketRedstoneFeeds().catch(e => {
  logger.error(e);
  process.exit(1);
});
