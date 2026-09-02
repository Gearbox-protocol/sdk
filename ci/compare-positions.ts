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
import type { ChainId, DataResponse, Position } from "../src/model/index.js";
import type { CreditAccountData, OnchainSDK } from "../src/onchain/index.js";
import { ADDRESS_0X0, hexEq, json_stringify } from "../src/onchain/index.js";
import { GearboxSDK } from "../src/sdk/GearboxSDK.js";

/**
 * Discovers every borrower via the credit account compressor, then lists
 * positions from both sources for each wallet and writes down where they
 * disagree.
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

const logger = createLogger();

/**
 * One credit account found on a chain, together with the wallet that holds
 * it as a borrower.
 **/
interface DiscoveredAccount {
  chainId: ChainId;
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
  chainId: ChainId;
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
 * One chain's discovery result, including accounts to fold into the dump.
 **/
interface DiscoveredChain {
  chain: ChainDiscovery;
  resolved: DiscoveredAccount[];
}

/**
 * Per-wallet listings dumped alongside the report.
 **/
interface PositionListingsDump {
  [wallet: string]: DataResponse<Position[]>;
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
      const filter = { chainIds: chainIdsOf(dump, wallet) };
      const [onchainList, offchainList] = await Promise.all([
        sdk.positions.onchain.list({ wallet, filter }),
        sdk.positions.offchain.list({ wallet, filter }),
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
  const reasons = printSummary(report);
  logger.info(`wrote ${OUT_DIR}/{borrowers,onchain,offchain,report}.json`);
  if (reasons.length) {
    for (const reason of reasons) {
      logger.error(reason);
    }
    process.exit(1);
  }
}

function chainIdsOf(dump: BorrowersDump, wallet: Address): ChainId[] {
  const chains = new Set(
    (dump.accountsByWallet[wallet] ?? []).map(account => account.chainId),
  );
  return [...chains];
}

async function discoverBorrowers(
  onchain: NonNullable<GearboxSDK<"both">["onchain"]>,
): Promise<BorrowersDump> {
  const accountsByWallet: Record<string, DiscoveredAccount[]> = {};

  const byChain: DiscoveredChain[] = await Promise.all(
    [...onchain.chains].map(async ([network, chainSdk]) => {
      try {
        const accounts = await chainSdk.accounts.getCreditAccounts({
          includeZeroDebt: true,
        });
        const resolved = await Promise.all(
          accounts.map(account => resolveAccount(chainSdk, network, account)),
        );
        const borrowers = new Set(resolved.map(account => account.borrower));
        logger.info(
          `${network}: ${resolved.length} accounts, ${borrowers.size} borrowers`,
        );
        return {
          chain: chainOf(network, chainSdk.chainId, resolved),
          resolved,
        };
      } catch (error) {
        const message = errorMessage(error);
        logger.error(
          { network, err: message },
          "failed to list credit accounts",
        );
        return {
          chain: chainOf(network, chainSdk.chainId, [], message),
          resolved: [],
        };
      }
    }),
  );

  for (const { resolved } of byChain) {
    for (const account of resolved) {
      const list = accountsByWallet[account.borrower] ?? [];
      list.push(account);
      accountsByWallet[account.borrower] = list;
    }
  }

  const wallets = Object.keys(accountsByWallet).sort() as Address[];
  return {
    wallets,
    byChain: byChain.map(entry => entry.chain),
    accountsByWallet,
  };
}

function chainOf(
  network: string,
  chainId: ChainId,
  resolved: DiscoveredAccount[],
  error?: string,
): ChainDiscovery {
  return {
    network,
    chainId,
    accounts: resolved.length,
    borrowers: new Set(resolved.map(account => account.borrower)).size,
    ...(error ? { error } : {}),
  };
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
    const investor = await factory.getInvestor(account.creditAccount, {
      fromCache: true,
    });
    if (!investor || hexEq(investor, ADDRESS_0X0)) {
      return account.owner;
    }
    return investor;
  } catch {
    return account.owner;
  }
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

function printSummary(report: PositionsCompareReport): string[] {
  const { summary } = report;
  return reportCompare("positions", report, [
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
