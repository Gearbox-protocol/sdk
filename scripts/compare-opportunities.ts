import { mkdir, writeFile } from "node:fs/promises";
import { pino } from "pino";
import type { OpportunityCompareReport } from "../src/dev/compareOpportunities.js";
import { compareOpportunities } from "../src/dev/compareOpportunities.js";
import { getAlchemyUrl } from "../src/dev/providers.js";
import { GearboxSDK } from "../src/new-sdk/GearboxSDK.js";
import type { NetworkType } from "../src/sdk/index.js";
import { json_stringify } from "../src/sdk/index.js";

/**
 * Lists opportunities from both sources against live data and writes down
 * where they disagree, for a later reading of the report.
 *
 * ```sh
 * ALCHEMY_KEY=... SOMNIA_PROVIDER=... ETHERLINK_PROVIDER=... pnpm tsx scripts/compare-opportunities.ts
 * ```
 *
 * Differences are expected — naming, USD values the backend smooths, fields
 * only the backend can fill, eligibility rules and formulas the two sides
 * define differently — so a disagreement is reported, never asserted on. The
 * run only fails when a source could not be read at all.
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
const OUT_DIR = "tmp/opportunities-compare";
const TIMEOUT = 480_000;

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    bindings: () => ({}),
    level: label => ({ level: label }),
  },
});

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
  // prices are left updateable: the USD values the chain reports are exactly
  // what a consumer would see, which is what makes them comparable
  await sdk.attach();

  logger.info(`reading both sources, backend at ${BACKEND_URL}`);
  const [onchain, offchain] = await Promise.all([
    sdk.opportunities.onchain.list(),
    sdk.opportunities.offchain.list(),
  ]);

  const report = compareOpportunities({
    onchain,
    offchain,
    backendUrl: BACKEND_URL,
    networks: NETWORKS,
  });

  await mkdir(OUT_DIR, { recursive: true });
  await Promise.all([
    writeFile(`${OUT_DIR}/onchain.json`, json_stringify(onchain)),
    writeFile(`${OUT_DIR}/offchain.json`, json_stringify(offchain)),
    writeFile(`${OUT_DIR}/report.json`, json_stringify(report)),
  ]);

  printSummary(report);
  logger.info(`wrote ${OUT_DIR}/{onchain,offchain,report}.json`);
}

function printSummary(report: OpportunityCompareReport): void {
  const { summary } = report;
  console.log(`\nopportunities from ${report.backendUrl} vs the chain`);
  console.table(
    summary.byChain.map(chain => ({
      chain: chain.chainId,
      onchain: chain.onchainRows,
      offchain: chain.offchainRows,
      matched: chain.matched,
      identical: chain.identical,
      differing: chain.differing,
      "only onchain": chain.onlyOnchain,
      "only offchain": chain.onlyOffchain,
    })),
  );
  console.log(
    `total: ${summary.onchainRows} onchain, ${summary.offchainRows} offchain, ` +
      `${summary.matched} matched (${summary.identical} identical, ${summary.differing} differing), ` +
      `${summary.onlyOnchain} only onchain, ${summary.onlyOffchain} only offchain`,
  );

  if (summary.diffsByPath.length) {
    console.log("\nfields that differed most often:");
    console.table(
      summary.diffsByPath.slice(0, 25).map(entry => ({
        field: entry.path,
        rows: entry.count,
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
