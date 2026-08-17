import { describe, expect, it } from "vitest";
import { GearboxSDK } from "../../new-sdk/index.js";
import { ANVIL_URL } from "../constants.js";
import { PYTH_API_PROXY, REDSTONE_GATEWAYS, useFixture } from "../helpers.js";

const BLOCK = 24_728_000n;

/**
 * Smoke of the loading policy on a fork: a read issued before `attach`
 * resolves attaches the SDK's own on-chain source and answers. Everything
 * else about loading is `new-sdk/GearboxSDK.loading.test.ts`.
 */
describe("GearboxSDK loading (fork)", () => {
  useFixture({ network: "Mainnet", block: BLOCK });

  it("a first read attaches and answers", async () => {
    const sdk = new GearboxSDK({
      mode: "onchain",
      networks: ["Mainnet"],
      onchain: {
        chains: { Mainnet: { rpcURLs: [ANVIL_URL], timeout: 120_000 } },
      },
      attach: {
        perChain: { Mainnet: { blockNumber: BLOCK } },
        redstone: { historicTimestamp: true, gateways: REDSTONE_GATEWAYS },
        pyth: { historicTimestamp: true, apiProxy: PYTH_API_PROXY },
      },
    });
    expect(sdk.attached).toBe(false);

    const opportunities = await sdk.opportunities.list();

    expect(sdk.attached).toBe(true);
    expect(opportunities.data.length).toBeGreaterThan(0);
    expect(opportunities.meta.chains[0]).toMatchObject({
      chainId: 1,
      status: "success",
      source: "onchain",
      blockNumber: Number(BLOCK),
    });
  });
});
