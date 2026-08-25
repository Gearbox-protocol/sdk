import { pino } from "pino";
import { getAlchemyUrl } from "../src/dev/providers.js";
import { toChainIds } from "../src/onchain/index.js";
import { GearboxSDK } from "../src/sdk/GearboxSDK.js";

/**
 * Lists every opportunity of one chain in `both` mode.
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
  const sdk = new GearboxSDK({
    mode: "both",
    networks: ["Mainnet", "Monad", "Plasma"],
    onchain: {
      chains: {
        Mainnet: {
          rpcURLs: [getAlchemyUrl("Mainnet", process.env.ALCHEMY_KEY)!],
          timeout: 480_000,
        },
        Monad: {
          rpcURLs: [getAlchemyUrl("Monad", process.env.ALCHEMY_KEY)!],
          timeout: 480_000,
        },
        Plasma: {
          rpcURLs: [getAlchemyUrl("Plasma", process.env.ALCHEMY_KEY)!],
          timeout: 480_000,
        },
      },
    },
    offchain: { baseUrl: BACKEND_URL },
    logger,
  });
  await sdk.attach();

  const combined = await sdk.opportunities.list();
  const offchain = await sdk.opportunities.offchain.list();
  const onchain = await sdk.onchain.opportunities.list();
  const merged = sdk.opportunities.merge.list(onchain, offchain);
  const filtered = sdk.opportunities.filter(merged, {
    chainIds: toChainIds(["Monad", "Plasma"]),
    underlyingType: "Stable",
  });

  console.log(
    JSON.stringify(
      {
        onchainMeta: onchain.meta,
        offchainMeta: offchain.meta,
        combinedMeta: combined.meta,
        mergedMeta: merged.meta,
        filteredMeta: filtered.meta,
        offcainData: offchain.data.length,
        onchainData: onchain.data.length,
        combinedData: combined.data.length,
        mergedData: merged.data.length,
        filteredData: filtered.data.length,
      },
      null,
      2,
    ),
  );
}

listOpportunities().catch(e => {
  logger.error(e);
  process.exit(1);
});
