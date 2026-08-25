/**
 * Temporary report of strategy-target gaps vs. the legacy hardcoded table.
 *
 * ```sh
 * ALCHEMY_KEY=... SOMNIA_PROVIDER=... ETHERLINK_PROVIDER=... pnpm tsx scripts/check-strategy-targets.ts
 * ```
 **/
import { pino } from "pino";
import { rpcUrls, TIMEOUT } from "../src/dev/mode-parity/scriptUtils.js";
import {
  getLegacyStrategyTarget,
  isStrategyCollateral,
  MultichainSDK,
  type StrategyCollateralProps,
} from "../src/onchain/index.js";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    bindings: () => ({}),
    level: label => ({ level: label }),
  },
});

interface CandidateToken {
  symbol: string;
  liquidationThreshold: number;
  mainPrice: bigint | undefined;
  hasActiveQuota: boolean;
}

interface CreditManagerRow {
  network: string;
  curatorName: string;
  name: string;
  creditManager: string;
  targetSymbol: string | undefined;
  hardcoded: boolean;
  withQuota: number;
  withoutQuota: number;
  candidates: CandidateToken[];
}

async function checkStrategyTargets(): Promise<void> {
  const urls = rpcUrls();

  const sdk = new MultichainSDK({
    chains: {
      Mainnet: { rpcURLs: [urls.Mainnet], timeout: TIMEOUT },
      Plasma: { rpcURLs: [urls.Plasma], timeout: TIMEOUT },
      Etherlink: { rpcURLs: [urls.Etherlink], timeout: TIMEOUT },
      Monad: { rpcURLs: [urls.Monad], timeout: TIMEOUT },
      Somnia: { rpcURLs: [urls.Somnia], timeout: TIMEOUT },
    },
    logger,
  });
  await sdk.attach();

  const rows: CreditManagerRow[] = [];

  for (const [network, chainSdk] of sdk.chains) {
    for (const market of chainSdk.marketRegister.markets) {
      for (const suite of market.creditManagers) {
        if (!suite.strategyOpportunity()) {
          continue;
        }

        const candidates: CandidateToken[] = [];
        let withQuota = 0;
        let withoutQuota = 0;

        for (const token of suite.creditManager.collateralTokens) {
          const meta = suite.sdk.tokensMeta.mustGet(token);
          const props: StrategyCollateralProps = {
            token,
            underlying: suite.creditManager.underlying,
            unwrappedUnderlying: suite.market.pool.unwrappedUnderlying,
            liquidationThreshold:
              suite.creditManager.liquidationThresholds.mustGet(token),
            contractType: meta.contractType,
            isExpired: meta.isExpired,
            mainPrice: suite.market.priceOracle.mainPrices.get(token)?.price,
            hasActiveQuota: suite.market.pool.pqk.hasActiveQuota(token),
          };

          if (isStrategyCollateral(props)) {
            withoutQuota += 1;
            candidates.push({
              symbol: suite.sdk.tokensMeta.mustGetToken(token).symbol,
              liquidationThreshold: props.liquidationThreshold,
              mainPrice: props.mainPrice,
              hasActiveQuota: props.hasActiveQuota,
            });
          }
          if (isStrategyCollateral(props, true)) {
            withQuota += 1;
          }
        }

        const target = suite.strategyTargetCollateral;
        rows.push({
          network,
          curatorName: market.curator.name ?? market.curator.address,
          name: suite.name,
          creditManager: suite.creditManager.address,
          targetSymbol: target
            ? suite.sdk.tokensMeta.mustGetToken(target).symbol
            : undefined,
          hardcoded:
            getLegacyStrategyTarget(
              suite.creditManager.address,
              suite.chainId,
            ) !== undefined,
          withQuota,
          withoutQuota,
          candidates,
        });
      }
    }
  }

  rows.sort((a, b) => b.withoutQuota - a.withoutQuota);

  for (const row of rows) {
    printCreditManagerRow(row);
  }
}

const RESET = "\x1b[0m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

function padRight(value: string, width: number): string {
  return value + " ".repeat(Math.max(0, width - value.length));
}

function padLeft(value: string, width: number): string {
  return " ".repeat(Math.max(0, width - value.length)) + value;
}

function isAmbiguous(row: CreditManagerRow): boolean {
  return !row.hardcoded && (row.withQuota > 1 || row.withoutQuota > 1);
}

function printCreditManagerRow(row: CreditManagerRow): void {
  const missingTarget = row.targetSymbol === undefined;
  const ambiguous = isAmbiguous(row);
  const target = missingTarget ? "⚠ NONE" : row.targetSymbol;
  const tag = row.hardcoded ? " 🔒 HARDCODED" : ambiguous ? " ⚠ AMBIGUOUS" : "";
  const prefix = row.hardcoded ? "🔒" : ambiguous || missingTarget ? "⚠" : " ";
  const color = row.hardcoded ? CYAN : ambiguous || missingTarget ? YELLOW : "";

  console.log(
    `${color}${prefix} ${row.network} | ${row.curatorName} | ${row.name} | ${row.creditManager} | ${target}${tag} | quoted=${row.withQuota} non-quoted=${row.withoutQuota}${RESET}`,
  );

  if (row.withQuota > 1 || row.withoutQuota > 1) {
    printCandidates(row.candidates);
  }
}

function printCandidates(candidates: CandidateToken[]): void {
  const symbolWidth = Math.max(...candidates.map(c => c.symbol.length));
  const ltWidth = Math.max(
    ...candidates.map(c => String(c.liquidationThreshold).length),
  );
  const priceWidth = Math.max(
    ...candidates.map(c =>
      c.mainPrice === undefined ? 1 : String(c.mainPrice).length,
    ),
  );

  for (const c of candidates) {
    const price = c.mainPrice === undefined ? "-" : String(c.mainPrice);
    console.log(
      `  ${padRight(c.symbol, symbolWidth)}  LT=${padLeft(String(c.liquidationThreshold), ltWidth)}  price=${padLeft(price, priceWidth)}  quoted=${padRight(c.hasActiveQuota ? "yes" : "no", 3)}`,
    );
  }
}

checkStrategyTargets().catch(e => {
  logger.error(e);
  process.exit(1);
});
