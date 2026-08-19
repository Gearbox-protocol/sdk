import { mkdir, writeFile } from "node:fs/promises";
import type { OpportunityCompareReport } from "../src/dev/mode-parity/compareOpportunities.js";
import { compareOpportunities } from "../src/dev/mode-parity/compareOpportunities.js";
import {
  BACKEND_URL,
  createLogger,
  NETWORKS,
  printCompareSummary,
  rpcUrls,
  TIMEOUT,
} from "../src/dev/mode-parity/scriptUtils.js";
import { GearboxSDK } from "../src/new-sdk/GearboxSDK.js";
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
const OUT_DIR = "tmp/opportunities-compare";

const logger = createLogger();

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
  printCompareSummary("opportunities", report, [
    `total: ${summary.onchainRows} onchain, ${summary.offchainRows} offchain, ` +
      `${summary.matched} matched (${summary.identical} identical, ${summary.clean} clean, ${summary.differing} differing), ` +
      `${summary.onlyOnchain} only onchain, ${summary.onlyOffchain} only offchain`,
  ]);
}

compare().catch(e => {
  logger.error(e);
  process.exit(1);
});
