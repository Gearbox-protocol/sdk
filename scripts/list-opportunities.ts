import { pino } from "pino";
import { getAlchemyUrl } from "../src/dev/providers.js";
import type { Bps, ChainMetadata, Opportunity } from "../src/model/index.js";
import { GearboxSDK } from "../src/new-sdk/GearboxSDK.js";
import type { NetworkType } from "../src/sdk/index.js";
import { chains } from "../src/sdk/index.js";

/**
 * Lists every opportunity of one chain in `both` mode, so the list is served by
 * the backend while it is no more than a couple of minutes behind, and by the
 * chain when it falls further behind or fails. The read is scoped to the chains
 * the SDK was configured for, so the backend is never asked for the rest of what
 * it knows.
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

  const { data, meta } = await sdk.opportunities.list();

  for (const opportunity of sortByName(data)) {
    console.log(describe(opportunity));
  }

  // each chain is served by one source, so which one won it — and how far behind
  // the block it answered at is — is part of the result rather than a detail of
  // how it was obtained
  console.log(`\n${data.length} opportunities on ${network}`);
  for (const chain of meta.chains) {
    console.log(`  ${chain.chainId}: ${describeChain(chain)}`);
  }
}

function describeChain(chain: ChainMetadata): string {
  if (chain.status === "error") {
    return `error from the ${chain.source ?? "only"} source: ${chain.error}`;
  }
  const at =
    chain.blockNumber === undefined ? "" : ` at block ${chain.blockNumber}`;
  return `served by ${chain.source}${at}`;
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
