import { beforeAll, describe, expect, it } from "vitest";
import { AccountsPlugin } from "../../plugins/accounts/AccountsPlugin.js";
import { AdaptersPlugin } from "../../plugins/adapters/AdaptersPlugin.js";
import { BotsPlugin } from "../../plugins/bots/index.js";
import { DegenDistributorsPlugin } from "../../plugins/degen-distributors/index.js";
import { Pools7DAgoPlugin } from "../../plugins/pools-history/index.js";
import { json_stringify, OnchainSDK } from "../../sdk/index.js";
import { ANVIL_URL } from "../constants.js";
import { PYTH_API_PROXY, REDSTONE_GATEWAYS, useFixture } from "../helpers.js";

const BLOCK = 24_736_900n;

describe("v12 parity tests", () => {
  let sdk: OnchainSDK;

  useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(async () => {
    sdk = new OnchainSDK(
      "Mainnet",
      { rpcURLs: [ANVIL_URL], timeout: 120_000 },
      {
        plugins: {
          adapters: new AdaptersPlugin(true),
          bots: new BotsPlugin(true),
          degen: new DegenDistributorsPlugin(true),
          pools7DAgo: new Pools7DAgoPlugin(true),
          accounts: new AccountsPlugin({ includeZeroDebt: true }, true),
        },
      },
    );
    await sdk.attach({
      blockNumber: BLOCK,
      redstone: {
        historicTimestamp: true,
        gateways: REDSTONE_GATEWAYS,
      },
      pyth: {
        historicTimestamp: true,
        apiProxy: PYTH_API_PROXY,
      },
    });
  });

  it("should produce same state as sdk v12", async () => {
    await expect(json_stringify(sdk.state)).toMatchFileSnapshot(
      `../fixtures/v12_state_${sdk.networkType}_${sdk.currentBlock}.json`,
    );
  });
});
