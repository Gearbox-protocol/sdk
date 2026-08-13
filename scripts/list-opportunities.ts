import { pino } from "pino";
import { getAlchemyUrl } from "../src/dev/providers.js";
import type { Bps, Opportunity } from "../src/model/index.js";
import { GearboxSDK } from "../src/new-sdk/GearboxSDK.js";
import type { NetworkType } from "../src/sdk/index.js";
import { chains } from "../src/sdk/index.js";

/**
 * Lists every opportunity of one chain in `both` mode, so each row is the
 * chain's view of a market merged with what only the backend knows — the yield
 * figures above all, which no amount of reading the chain produces.
 *
 * ```sh
 * RPC_URL=https://... pnpm list-opportunities
 * NETWORK=Plasma ALCHEMY_KEY=... pnpm list-opportunities
 * ```
 **/
const BACKEND_URL = "https://api.gear-dev.dev";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    bindings: () => ({}),
    level: label => ({ level: label }),
  },
});

async function listOpportunities(): Promise<void> {
  const network = requireNetwork(process.env.NETWORK ?? "Mainnet");
  const rpcURL =
    process.env.RPC_URL ?? getAlchemyUrl(network, process.env.ALCHEMY_KEY);
  if (!rpcURL) {
    throw new Error(
      `no RPC for ${network}: set RPC_URL, or ALCHEMY_KEY if ${network} is on Alchemy`,
    );
  }

  const sdk = new GearboxSDK({
    mode: "both",
    networks: [network],
    onchain: { chains: { [network]: { rpcURLs: [rpcURL], timeout: 480_000 } } },
    offchain: { baseUrl: BACKEND_URL },
    logger,
  });
  try {
    await sdk.attach();
  } catch (e) {
    // a source that cannot answer is reported rather than fatal: the list is
    // still served by the backend alone, which is the point of `both` mode
    logger.warn(e, `could not attach to ${network}, reading the backend alone`);
  }

  // without this the backend would answer for every chain it knows while the
  // chain leg only covers this one, and the two halves of the list would not
  // be about the same thing
  const { result, meta } = await sdk.opportunities.list({
    chainIds: [chains[network].id],
  });

  for (const opportunity of sortByName(result)) {
    console.log(describe(opportunity));
  }

  // a read is served by whatever answered, so the outcome per source is part
  // of the result rather than a detail of how it was obtained
  console.log(`\n${result.length} opportunities on ${network}`);
  for (const chain of meta.chains) {
    console.log(`  ${chain.network}: ${chain.status}`);
  }
  console.log(`  ${BACKEND_URL}: ${meta.offchain?.status ?? "not asked"}`);
  if (meta.offchain?.status === "error") {
    console.log(`    ${meta.offchain.error}`);
  }
}

function describe(opportunity: Opportunity): string {
  const curator = opportunity.curator.name ?? opportunity.curator.address;
  const apy =
    opportunity.kind === "pool"
      ? opportunity.supplyApy.totalApy
      : opportunity.maxLeverageApy?.totalApy;
  return [
    opportunity.kind.padEnd(8),
    String(opportunity.chainId).padEnd(6),
    opportunity.name.padEnd(32),
    curator.padEnd(18),
    percent(apy).padStart(9),
  ].join(" ");
}

function percent(bps: Bps | undefined): string {
  return bps === undefined ? "-" : `${(bps / 100).toFixed(2)}%`;
}

function sortByName(opportunities: Opportunity[]): Opportunity[] {
  return [...opportunities].sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name),
  );
}

function requireNetwork(name: string): NetworkType {
  if (!(name in chains)) {
    throw new Error(`unknown network ${name}`);
  }
  return name as NetworkType;
}

listOpportunities().catch(e => {
  logger.error(e);
  process.exit(1);
});
