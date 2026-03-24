import type { Address } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { GearboxSDK } from "../../sdk/index.js";
import { ANVIL_URL } from "../constants.js";
import { PYTH_API_PROXY, REDSTONE_GATEWAYS, useFixture } from "../helpers.js";

const BLOCK = 24_728_000n;
const MC_CP0X: Address = "0xc168343c791d56dd1da4b4b8b0cc1c1ec1a16e6b";
const MC_INVARIANT: Address = "0x7a133fbd01736fd076158307c9476cc3877f1af5";

describe("Multiple SDK instances can be attached", () => {
  let sdk1: GearboxSDK;
  let sdk2: GearboxSDK;

  useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(async () => {
    const commonOpts = {
      rpcURLs: [ANVIL_URL],
      timeout: 120_000,
      blockNumber: BLOCK,
      ignoreUpdateablePrices: false,
      redstone: {
        historicTimestamp: true as const,
        ignoreMissingFeeds: true,
        gateways: REDSTONE_GATEWAYS,
      },
      pyth: {
        historicTimestamp: true as const,
        ignoreMissingFeeds: true,
        apiProxy: PYTH_API_PROXY,
      },
    };

    sdk1 = await GearboxSDK.attach({
      ...commonOpts,
      marketConfigurators: [MC_CP0X],
    });
    sdk2 = await GearboxSDK.attach({
      ...commonOpts,
      marketConfigurators: [MC_INVARIANT],
    });
  });

  it("instances are fully isolated: markets, contracts, and references", () => {
    const markets1 = sdk1.marketRegister.markets;
    const markets2 = sdk2.marketRegister.markets;
    expect(markets1.length).toBeGreaterThan(0);
    expect(markets2.length).toBeGreaterThan(0);

    for (const m of markets1) {
      expect(m.configurator.address.toLowerCase()).toBe(MC_CP0X.toLowerCase());
    }
    for (const m of markets2) {
      expect(m.configurator.address.toLowerCase()).toBe(
        MC_INVARIANT.toLowerCase(),
      );
    }

    const pool1Addr = markets1[0].pool.pool.address;
    const pool2Addr = markets2[0].pool.pool.address;
    expect(sdk1.getContract(pool1Addr)).toBeDefined();
    expect(sdk2.getContract(pool1Addr)).toBeUndefined();
    expect(sdk2.getContract(pool2Addr)).toBeDefined();
    expect(sdk1.getContract(pool2Addr)).toBeUndefined();

    expect(sdk1.addressProvider.address).toBe(sdk2.addressProvider.address);
    expect(sdk1.addressProvider).not.toBe(sdk2.addressProvider);
  });

  it("token meta works independently across instances", () => {
    const weth1 = sdk1.tokensMeta.findBySymbol("WETH");
    const weth2 = sdk2.tokensMeta.findBySymbol("WETH");
    expect(weth1).toBeDefined();
    expect(weth2).toBeDefined();

    const w1 = weth1 as NonNullable<typeof weth1>;
    const w2 = weth2 as NonNullable<typeof weth2>;
    expect(w1.addr).toBe(w2.addr);
    expect(w1.decimals).toBe(w2.decimals);

    const sdk1Tokens = new Set(sdk1.tokensMeta.keys());
    const sdk2Tokens = new Set(sdk2.tokensMeta.keys());
    const onlyInSdk1 = [...sdk1Tokens].filter(t => !sdk2Tokens.has(t));
    const onlyInSdk2 = [...sdk2Tokens].filter(t => !sdk1Tokens.has(t));

    for (const addr of onlyInSdk1) {
      expect(sdk1.tokensMeta.get(addr)).toBeDefined();
      expect(sdk2.tokensMeta.get(addr)).toBeUndefined();
    }
    for (const addr of onlyInSdk2) {
      expect(sdk2.tokensMeta.get(addr)).toBeDefined();
      expect(sdk1.tokensMeta.get(addr)).toBeUndefined();
    }

    expect(() =>
      sdk1.tokensMeta.formatBN(w1.addr, 1000000000000000000n),
    ).not.toThrow();
    expect(() =>
      sdk2.tokensMeta.formatBN(w2.addr, 1000000000000000000n),
    ).not.toThrow();
  });
});
