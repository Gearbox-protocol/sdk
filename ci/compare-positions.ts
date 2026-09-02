import { mkdir, writeFile } from "node:fs/promises";
import type { Address } from "viem";
import { getAddress, isAddress } from "viem";
import type {
  PositionsCompareReport,
  WalletPositions,
  WalletPositionsFailure,
} from "../src/dev/mode-parity/comparePositions.js";
import { comparePositions } from "../src/dev/mode-parity/comparePositions.js";
import {
  BACKEND_URL,
  createLogger,
  errorMessage,
  mapPool,
  NETWORKS,
  reportCompare,
  rpcUrls,
  TIMEOUT,
} from "../src/dev/mode-parity/scriptUtils.js";
import type {
  AnalyticsPosition,
  ChainId,
  ChainMetadata,
  DataResponse,
  Position,
  PositionKind,
  ResponseMetadata,
} from "../src/model/index.js";
import { getNetworkType, hexEq, json_stringify } from "../src/onchain/index.js";
import { GearboxSDK } from "../src/sdk/GearboxSDK.js";

/**
 * Pages the protocol-wide analytics list once per position kind as the
 * offchain set, then lists matching onchain rows wallet-by-wallet with
 * `filter.kind` so a pool-only wallet never hits the credit-account
 * compressor.
 *
 * ```sh
 * ALCHEMY_KEY=... SOMNIA_PROVIDER=... ETHERLINK_PROVIDER=... pnpm tsx ci/compare-positions.ts
 * ```
 *
 * Optional: `WALLETS=0x...,0x...` restricts the comparison to a subset of the
 * discovered borrowers; `CONCURRENCY=4` caps how many wallets are listed at
 * once. Expected diffs (mode-scoped, backend-preferred, or within tolerance)
 * are reported but do not fail the run. The process exits 1 on unexpected
 * diffs, membership gaps, a chain that could not be read, wallets that failed
 * to list, or when both sources produced no data.
 **/
const OUT_DIR = "tmp/positions-compare";
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY ?? 4) || 4);
const PAGE_SIZE = 100;
const KINDS: PositionKind[] = ["pool", "strategy", "liquidation"];

const logger = createLogger();

/**
 * One protocol-wide position row used to discover its borrower, slim enough
 * for the dump.
 **/
interface DiscoveredPosition {
  chainId: ChainId;
  kind: PositionKind;
  borrower: Address;
}

/**
 * How many positions and distinct borrowers one chain yielded, broken out by
 * kind.
 **/
interface ChainDiscovery {
  network: string;
  chainId: ChainId;
  positions: number;
  pool: number;
  strategy: number;
  liquidation: number;
  borrowers: number;
}

/**
 * The borrower set written to `borrowers.json`.
 **/
interface BorrowersDump {
  wallets: Address[];
  byChain: ChainDiscovery[];
  positionsByWallet: Record<string, DiscoveredPosition[]>;
}

/**
 * Per-wallet listings dumped alongside the report.
 **/
interface PositionListingsDump {
  [wallet: string]: DataResponse<Position[]>;
}

/**
 * One kind's analytics page, plus the per-chain meta to stamp onto offchain
 * listings so the report still names backend blocks.
 **/
interface AnalyticsKindList {
  kind: PositionKind;
  rows: AnalyticsPosition[];
  meta: ResponseMetadata;
}

/**
 * Distinct wallets and row count of one kind in the discovery dump.
 **/
interface KindDiscoveryCounts {
  kind: PositionKind;
  wallets: number;
  positions: number;
}

function parseWallets(): Address[] | undefined {
  const raw = process.env.WALLETS;
  if (!raw) {
    return undefined;
  }
  return raw.split(",").map(part => {
    const trimmed = part.trim();
    if (!isAddress(trimmed)) {
      throw new Error(
        `WALLETS contains a value that is not an address: ${part}`,
      );
    }
    return getAddress(trimmed);
  });
}

async function compare(): Promise<void> {
  const urls = rpcUrls();
  const sdk = new GearboxSDK({
    mode: "both",
    networks: NETWORKS,
    onchain: {
      chains: Object.fromEntries(
        NETWORKS.map(network => [
          network,
          { rpcURLs: [urls[network]], timeout: TIMEOUT },
        ]),
      ),
    },
    offchain: { baseUrl: BACKEND_URL },
    logger,
  });

  logger.info(`attaching to ${NETWORKS.join(", ")}`);
  await sdk.attach();

  logger.info("listing analytics positions per kind");
  const listed: AnalyticsKindList[] = [];
  for (const kind of KINDS) {
    listed.push(await listAnalyticsKind(sdk, kind));
  }

  const dump = dumpOf(listed.flatMap(entry => entry.rows));
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(`${OUT_DIR}/borrowers.json`, json_stringify(dump));
  printDiscovery(dump);

  const requested = parseWallets();
  const reasons: string[] = [];
  let kindsCompared = 0;

  for (const entry of listed) {
    const kindReasons = await compareKind(sdk, entry, requested);
    if (kindReasons === undefined) {
      continue;
    }
    kindsCompared += 1;
    reasons.push(...kindReasons.map(reason => `${entry.kind}: ${reason}`));
  }

  if (kindsCompared === 0) {
    const report = comparePositions({
      wallets: [],
      backendUrl: BACKEND_URL,
      networks: NETWORKS,
    });
    await writeFile(`${OUT_DIR}/report.json`, json_stringify(report));
    reasons.push(...reportCompare("positions", report));
  }

  logger.info(
    `wrote ${OUT_DIR}/{borrowers,onchain-*,offchain-*,report-*}.json`,
  );
  if (reasons.length) {
    for (const reason of reasons) {
      logger.error(reason);
    }
    process.exit(1);
  }
}

/**
 * Pages one kind of the protocol-wide list until every matching row is in
 * hand. Meta is merged across pages, preferring a chain that answered.
 **/
async function listAnalyticsKind(
  sdk: GearboxSDK<"both">,
  kind: PositionKind,
): Promise<AnalyticsKindList> {
  const rows: AnalyticsPosition[] = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;
  let meta: ResponseMetadata = { chains: [] };

  while (offset < total) {
    const page = await sdk.analytics.positions.list({
      kind,
      sortBy: "borrower",
      sortDirection: "asc",
      offset,
      limit: PAGE_SIZE,
    });
    const { items, total: pageTotal, offset: pageOffset } = page.data;
    total = pageTotal;
    rows.push(...items);
    meta = mergeMeta(meta, page.meta);
    offset = pageOffset + items.length;
    logger.info(
      `${kind} analytics positions: ${Math.min(offset, total)}/${total}`,
    );
    if (items.length === 0) {
      break;
    }
  }

  return { kind, rows, meta };
}

function mergeMeta(
  left: ResponseMetadata,
  right: ResponseMetadata,
): ResponseMetadata {
  const byChain = new Map<ChainId, ChainMetadata>();
  for (const chain of [...left.chains, ...right.chains]) {
    const existing = byChain.get(chain.chainId);
    if (
      !existing ||
      (existing.status !== "success" && chain.status === "success")
    ) {
      byChain.set(chain.chainId, chain);
    }
  }
  return {
    chains: [...byChain.values()].sort((a, b) => a.chainId - b.chainId),
  };
}

/**
 * Lists onchain rows for this kind's borrowers, compares them to the
 * analytics rows (with `borrower` stripped), and writes per-kind dumps.
 * Returns `undefined` when the kind has nothing to compare.
 **/
async function compareKind(
  sdk: GearboxSDK<"both">,
  listed: AnalyticsKindList,
  requested: Address[] | undefined,
): Promise<string[] | undefined> {
  const { kind, rows, meta } = listed;
  if (rows.length === 0) {
    logger.info(`skipping ${kind}: analytics returned no rows`);
    return undefined;
  }

  const byWallet = groupByBorrower(rows);
  const wallets = Object.keys(byWallet)
    .sort()
    .filter(wallet =>
      requested
        ? requested.some(wanted => hexEq(wanted, wallet as Address))
        : true,
    ) as Address[];

  if (wallets.length === 0) {
    logger.info(`skipping ${kind}: no wallets after filter`);
    return undefined;
  }

  logger.info(
    `comparing ${wallets.length} ${kind} wallets (of ${Object.keys(byWallet).length} discovered) at concurrency ${CONCURRENCY}, backend ${BACKEND_URL}`,
  );

  const listings: WalletPositions[] = [];
  const failures: WalletPositionsFailure[] = [];
  const onchainDump: PositionListingsDump = {};
  const offchainDump: PositionListingsDump = {};
  let done = 0;

  await mapPool(wallets, CONCURRENCY, async wallet => {
    const walletRows = byWallet[wallet] ?? [];
    const offchain: DataResponse<Position[]> = {
      data: walletRows.map(asPosition),
      meta,
    };
    try {
      const onchain = await sdk.positions.onchain.list({
        wallet,
        filter: { kind, chainIds: chainIdsOf(walletRows) },
      });
      listings.push({ wallet, onchain, offchain });
      onchainDump[wallet] = onchain;
      offchainDump[wallet] = offchain;
    } catch (error) {
      const message = errorMessage(error);
      logger.warn({ wallet, kind, err: message }, "failed to list positions");
      failures.push({ wallet, error: message });
    }
    done += 1;
    logger.info({ wallet, kind, done, total: wallets.length }, "listed wallet");
  });

  const report = comparePositions({
    wallets: listings,
    failures,
    backendUrl: BACKEND_URL,
    networks: NETWORKS,
  });

  await Promise.all([
    writeFile(`${OUT_DIR}/onchain-${kind}.json`, json_stringify(onchainDump)),
    writeFile(`${OUT_DIR}/offchain-${kind}.json`, json_stringify(offchainDump)),
    writeFile(`${OUT_DIR}/report-${kind}.json`, json_stringify(report)),
  ]);

  return printSummary(kind, report);
}

function asPosition(row: AnalyticsPosition): Position {
  const { borrower, ...position } = row;
  return position;
}

function groupByBorrower(
  rows: AnalyticsPosition[],
): Record<string, AnalyticsPosition[]> {
  const byWallet: Record<string, AnalyticsPosition[]> = {};
  for (const row of rows) {
    const list = byWallet[row.borrower] ?? [];
    list.push(row);
    byWallet[row.borrower] = list;
  }
  return byWallet;
}

function chainIdsOf(rows: AnalyticsPosition[]): ChainId[] {
  return [...new Set(rows.map(row => row.chainId))];
}

function dumpOf(rows: AnalyticsPosition[]): BorrowersDump {
  const positions: DiscoveredPosition[] = rows.map(row => ({
    chainId: row.chainId,
    kind: row.kind,
    borrower: row.borrower,
  }));
  const positionsByWallet: Record<string, DiscoveredPosition[]> = {};
  for (const position of positions) {
    const list = positionsByWallet[position.borrower] ?? [];
    list.push(position);
    positionsByWallet[position.borrower] = list;
  }
  return {
    wallets: Object.keys(positionsByWallet).sort() as Address[],
    byChain: byChainOf(positions),
    positionsByWallet,
  };
}

function byChainOf(positions: DiscoveredPosition[]): ChainDiscovery[] {
  const rowsByChain = new Map<ChainId, DiscoveredPosition[]>();
  for (const position of positions) {
    const list = rowsByChain.get(position.chainId) ?? [];
    list.push(position);
    rowsByChain.set(position.chainId, list);
  }

  return [...rowsByChain.entries()]
    .sort(([a], [b]) => a - b)
    .map(([chainId, rows]) => {
      const ofKind = (kind: PositionKind): number =>
        rows.filter(row => row.kind === kind).length;
      return {
        network: getNetworkType(chainId),
        chainId,
        positions: rows.length,
        pool: ofKind("pool"),
        strategy: ofKind("strategy"),
        liquidation: ofKind("liquidation"),
        borrowers: new Set(rows.map(row => row.borrower)).size,
      };
    });
}

function kindCountsOf(dump: BorrowersDump): KindDiscoveryCounts[] {
  return KINDS.map(kind => {
    const wallets = new Set<string>();
    let positions = 0;
    for (const [wallet, rows] of Object.entries(dump.positionsByWallet)) {
      const n = rows.filter(row => row.kind === kind).length;
      if (n === 0) {
        continue;
      }
      wallets.add(wallet);
      positions += n;
    }
    return { kind, wallets: wallets.size, positions };
  });
}

function printDiscovery(dump: BorrowersDump): void {
  console.log("\nborrowers discovered via analytics positions list");
  console.table(
    dump.byChain.map(chain => ({
      network: chain.network,
      chain: chain.chainId,
      positions: chain.positions,
      pool: chain.pool,
      strategy: chain.strategy,
      liquidation: chain.liquidation,
      borrowers: chain.borrowers,
    })),
  );
  console.log(`${dump.wallets.length} distinct wallets`);
  console.log("distinct wallets per kind");
  console.table(
    kindCountsOf(dump).map(row => ({
      kind: row.kind,
      wallets: row.wallets,
      positions: row.positions,
    })),
  );
}

function printSummary(
  kind: PositionKind,
  report: PositionsCompareReport,
): string[] {
  const { summary } = report;
  return reportCompare(`positions (${kind})`, report, [
    `wallets: ${summary.wallets} compared, ${summary.walletsClean} clean, ${summary.walletsFailed} failed`,
    `positions: ${summary.onchainRows} onchain, ${summary.offchainRows} offchain, ` +
      `${summary.matched} matched (${summary.identical} identical, ${summary.clean} clean, ${summary.differing} differing), ` +
      `${summary.onlyOnchain} only onchain, ${summary.onlyOffchain} only offchain`,
  ]);
}

compare().catch(e => {
  logger.error(e);
  process.exit(1);
});
