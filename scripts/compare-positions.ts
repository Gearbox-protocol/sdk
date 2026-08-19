import { mkdir, writeFile } from "node:fs/promises";
import { pino } from "pino";
import type { Address } from "viem";
import { getAddress, isAddress } from "viem";
import type {
  PositionsCompareReport,
  WalletPositions,
  WalletPositionsFailure,
} from "../src/dev/comparePositions.js";
import { comparePositions } from "../src/dev/comparePositions.js";
import { getAlchemyUrl } from "../src/dev/providers.js";
import type { DataResponse, Position } from "../src/model/index.js";
import { GearboxSDK } from "../src/new-sdk/GearboxSDK.js";
import type {
  CreditAccountData,
  NetworkType,
  OnchainSDK,
} from "../src/sdk/index.js";
import { ADDRESS_0X0, hexEq, json_stringify } from "../src/sdk/index.js";

/**
 * Discovers every borrower via the credit account compressor, then lists
 * positions from both sources for each wallet and writes down where they
 * disagree.
 *
 * ```sh
 * ALCHEMY_KEY=... SOMNIA_PROVIDER=... ETHERLINK_PROVIDER=... pnpm tsx scripts/compare-positions.ts
 * ```
 *
 * Optional: `WALLETS=0x...,0x...` restricts the comparison to a subset of the
 * discovered borrowers; `CONCURRENCY=4` caps how many wallets are listed at
 * once. Differences are expected, so a disagreement is reported, never
 * asserted on. The run only fails when attach itself cannot complete.
 **/
type ComparedNetwork = "Mainnet" | "Monad" | "Plasma" | "Somnia" | "Etherlink";

const NETWORKS: ComparedNetwork[] = [
  "Mainnet",
  "Monad",
  "Plasma",
  "Somnia",
  "Etherlink",
];

const BACKEND_URL = process.env.BACKEND_URL ?? "https://api.gear-dev.dev";
const OUT_DIR = "tmp/positions-compare";
const TIMEOUT = 480_000;
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY ?? 4) || 4);

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    bindings: () => ({}),
    level: label => ({ level: label }),
  },
});

/**
 * One credit account found on a chain, together with the wallet that holds
 * it as a borrower.
 **/
interface DiscoveredAccount {
  chainId: number;
  network: string;
  creditAccount: Address;
  creditManager: Address;
  owner: Address;
  borrower: Address;
}

/**
 * How many accounts and distinct borrowers one chain yielded.
 **/
interface ChainDiscovery {
  network: string;
  chainId: number;
  accounts: number;
  borrowers: number;
  error?: string;
}

/**
 * The borrower set written to `borrowers.json`.
 **/
interface BorrowersDump {
  wallets: Address[];
  byChain: ChainDiscovery[];
  accountsByWallet: Record<string, DiscoveredAccount[]>;
}

/**
 * Per-wallet listings dumped alongside the report.
 **/
interface PositionListingsDump {
  [wallet: string]: DataResponse<Position[]>;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required to reach the chains this script reads`,
    );
  }
  return value;
}

function rpcUrls(): Record<ComparedNetwork, string> {
  const alchemyKey = requireEnv("ALCHEMY_KEY");
  const alchemy = (network: NetworkType): string => {
    const url = getAlchemyUrl(network, alchemyKey);
    if (!url) {
      throw new Error(`Alchemy serves no URL for ${network}`);
    }
    return url;
  };
  return {
    Mainnet: alchemy("Mainnet"),
    Monad: alchemy("Monad"),
    Plasma: alchemy("Plasma"),
    Somnia: requireEnv("SOMNIA_PROVIDER"),
    Etherlink: requireEnv("ETHERLINK_PROVIDER"),
  };
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

  const onchain = sdk.onchain;
  if (!onchain) {
    throw new Error("onchain source is missing after attach");
  }

  logger.info("discovering borrowers via getCreditAccounts");
  const dump = await discoverBorrowers(onchain);
  const requested = parseWallets();
  const wallets = requested
    ? dump.wallets.filter(wallet =>
        requested.some(wanted => hexEq(wanted, wallet)),
      )
    : dump.wallets;

  logger.info(
    `comparing ${wallets.length} wallets (of ${dump.wallets.length} discovered) at concurrency ${CONCURRENCY}, backend ${BACKEND_URL}`,
  );

  const listings: WalletPositions[] = [];
  const failures: WalletPositionsFailure[] = [];
  const onchainDump: PositionListingsDump = {};
  const offchainDump: PositionListingsDump = {};
  let done = 0;

  await mapPool(wallets, CONCURRENCY, async wallet => {
    try {
      const [onchainList, offchainList] = await Promise.all([
        sdk.positions.onchain.list({ wallet }),
        sdk.positions.offchain.list({ wallet }),
      ]);
      listings.push({ wallet, onchain: onchainList, offchain: offchainList });
      onchainDump[wallet] = onchainList;
      offchainDump[wallet] = offchainList;
    } catch (error) {
      const message = errorMessage(error);
      logger.warn({ wallet, err: message }, "failed to list positions");
      failures.push({ wallet, error: message });
    }
    done += 1;
    logger.info({ wallet, done, total: wallets.length }, "listed wallet");
  });

  const report = comparePositions({
    wallets: listings,
    failures,
    backendUrl: BACKEND_URL,
    networks: NETWORKS,
  });

  await mkdir(OUT_DIR, { recursive: true });
  await Promise.all([
    writeFile(`${OUT_DIR}/borrowers.json`, json_stringify(dump)),
    writeFile(`${OUT_DIR}/onchain.json`, json_stringify(onchainDump)),
    writeFile(`${OUT_DIR}/offchain.json`, json_stringify(offchainDump)),
    writeFile(`${OUT_DIR}/report.json`, json_stringify(report)),
  ]);

  printDiscovery(dump);
  printSummary(report);
  logger.info(`wrote ${OUT_DIR}/{borrowers,onchain,offchain,report}.json`);
}

async function discoverBorrowers(
  onchain: NonNullable<GearboxSDK<"both">["onchain"]>,
): Promise<BorrowersDump> {
  const byChain: ChainDiscovery[] = [];
  const accountsByWallet: Record<string, DiscoveredAccount[]> = {};

  for (const [network, chainSdk] of onchain.chains) {
    try {
      const accounts = await chainSdk.accounts.getCreditAccounts({
        includeZeroDebt: true,
      });
      const resolved = await Promise.all(
        accounts.map(account => resolveAccount(chainSdk, network, account)),
      );
      const borrowers = new Set(resolved.map(account => account.borrower));
      byChain.push({
        network,
        chainId: chainSdk.chainId,
        accounts: resolved.length,
        borrowers: borrowers.size,
      });
      for (const account of resolved) {
        const list = accountsByWallet[account.borrower] ?? [];
        list.push(account);
        accountsByWallet[account.borrower] = list;
      }
      logger.info(
        `${network}: ${resolved.length} accounts, ${borrowers.size} borrowers`,
      );
    } catch (error) {
      const message = errorMessage(error);
      logger.error({ network, err: message }, "failed to list credit accounts");
      byChain.push({
        network,
        chainId: chainSdk.chainId,
        accounts: 0,
        borrowers: 0,
        error: message,
      });
    }
  }

  const wallets = Object.keys(accountsByWallet).sort() as Address[];
  return { wallets, byChain, accountsByWallet };
}

async function resolveAccount(
  chainSdk: OnchainSDK,
  network: string,
  account: CreditAccountData,
): Promise<DiscoveredAccount> {
  const borrower = await resolveBorrower(chainSdk, account);
  return {
    chainId: chainSdk.chainId,
    network,
    creditAccount: account.creditAccount,
    creditManager: account.creditManager,
    owner: account.owner,
    borrower,
  };
}

/**
 * RWA accounts are owned on-chain by a per-account vault proxy; the wallet
 * that holds them is the factory's investor. Anything else is owned by the
 * wallet itself.
 **/
async function resolveBorrower(
  chainSdk: OnchainSDK,
  account: CreditAccountData,
): Promise<Address> {
  try {
    const factory = chainSdk.marketRegister.findByCreditManager(
      account.creditManager,
    ).rwaFactory;
    if (!factory) {
      return account.owner;
    }
    const investor = await factory.getInvestor(account.creditAccount, true);
    if (!investor || hexEq(investor, ADDRESS_0X0)) {
      return account.owner;
    }
    return investor;
  } catch {
    return account.owner;
  }
}

async function mapPool<T>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (true) {
        const index = next;
        next += 1;
        const item = items[index];
        if (item === undefined) {
          return;
        }
        await fn(item);
      }
    },
  );
  await Promise.all(workers);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function printDiscovery(dump: BorrowersDump): void {
  console.log("\nborrowers discovered via getCreditAccounts");
  console.table(
    dump.byChain.map(chain => ({
      network: chain.network,
      chain: chain.chainId,
      accounts: chain.accounts,
      borrowers: chain.borrowers,
      error: chain.error ?? "",
    })),
  );
  console.log(`${dump.wallets.length} distinct wallets`);
}

function printSummary(report: PositionsCompareReport): void {
  const { summary } = report;
  console.log(`\npositions from ${report.backendUrl} vs the chain`);
  console.table(
    summary.byChain.map(chain => ({
      chain: chain.chainId,
      onchain: chain.onchainRows,
      offchain: chain.offchainRows,
      matched: chain.matched,
      identical: chain.identical,
      clean: chain.clean,
      differing: chain.differing,
      "only onchain": chain.onlyOnchain,
      "only offchain": chain.onlyOffchain,
    })),
  );
  console.log(
    `wallets: ${summary.wallets} compared, ${summary.walletsClean} clean, ${summary.walletsFailed} failed`,
  );
  console.log(
    `positions: ${summary.onchainRows} onchain, ${summary.offchainRows} offchain, ` +
      `${summary.matched} matched (${summary.identical} identical, ${summary.clean} clean, ${summary.differing} differing), ` +
      `${summary.onlyOnchain} only onchain, ${summary.onlyOffchain} only offchain`,
  );

  const unexpected = summary.diffsByPath.filter(entry => entry.unexpected > 0);
  const expected = summary.diffsByPath.filter(
    entry => entry.unexpected === 0 && entry.expected > 0,
  );

  if (unexpected.length) {
    console.log("\nunexpected fields that differed most often:");
    console.table(
      unexpected.slice(0, 25).map(entry => ({
        field: entry.path,
        unexpected: entry.unexpected,
        expected: entry.expected,
        kinds: entry.kinds.join(", "),
      })),
    );
  }

  if (expected.length) {
    console.log("\nexpected fields (mode-scoped or within tolerance):");
    console.table(
      expected.slice(0, 25).map(entry => ({
        field: entry.path,
        rows: entry.expected,
        kinds: entry.kinds.join(", "),
      })),
    );
  }

  for (const chain of [...report.onchainChains, ...report.offchainChains]) {
    if (chain.status === "error") {
      console.log(
        `chain ${chain.chainId} failed on ${chain.source}:`,
        chain.error,
      );
    }
  }
}

compare().catch(e => {
  logger.error(e);
  process.exit(1);
});
