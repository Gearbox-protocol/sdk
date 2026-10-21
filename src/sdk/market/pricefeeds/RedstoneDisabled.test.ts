import {
  type Address,
  createPublicClient,
  custom,
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  encodeFunctionResult,
  isHex,
  multicall3Abi,
  parseAbi,
  stringToHex,
} from "viem";
import { afterEach, describe, expect, it, vi } from "vitest";
import { iAddressProviderV310Abi } from "../../../abi/310/generated.js";
import { marketCompressorAbi } from "../../../abi/compressors/marketCompressor.js";
import { priceFeedCompressorAbi } from "../../../abi/compressors/priceFeedCompressor.js";
import { getUpdatablePriceFeeds } from "../../../permissionless/utils/price-update/get-updatable-feeds.js";
import type { PriceOracleData } from "../../base/index.js";
import { chains } from "../../chain/chains.js";
import { GearboxSDK } from "../../GearboxSDK.js";
import { REDSTONE_MARKET } from "./RedstoneDisabled.mock.js";
import { RedstonePriceFeedContract } from "./RedstonePriceFeed.js";
import { fetchRedstonePayloads } from "./updates/fetchRedstonePayloads.js";
import { RedstoneUpdater } from "./updates/RedstoneUpdater.js";

vi.mock("./updates/fetchRedstonePayloads.js", () => ({
  fetchRedstonePayloads: vi
    .fn()
    .mockRejectedValue(new Error("public_gateway_rejected: 403")),
}));

const CONFIGURATOR: Address = "0x1111111111111111111111111111111111111111";
const FEED: Address = "0x2222222222222222222222222222222222222222";
const ORACLE: Address = "0x3333333333333333333333333333333333333333";
const baseParams = {
  addr: FEED,
  version: 310n,
  contractType: stringToHex("PRICE_FEED::REDSTONE", { size: 32 }),
  serializedParams: encodeAbiParameters(
    [
      { type: "address" },
      { type: "bytes32" },
      { type: "string" },
      { type: "address[10]" },
      { type: "uint8" },
      { type: "uint128" },
      { type: "uint40" },
    ],
    [
      CONFIGURATOR,
      stringToHex("ETH", { size: 32 }),
      "redstone-primary-prod",
      [
        CONFIGURATOR,
        CONFIGURATOR,
        CONFIGURATOR,
        CONFIGURATOR,
        CONFIGURATOR,
        CONFIGURATOR,
        CONFIGURATOR,
        CONFIGURATOR,
        CONFIGURATOR,
        CONFIGURATOR,
      ],
      5,
      2000_00000000n,
      1000,
    ],
  ),
};

function oracleState(price: bigint): PriceOracleData {
  return {
    baseParams: {
      ...baseParams,
      addr: ORACLE,
      contractType: stringToHex("PRICE_ORACLE", { size: 32 }),
      serializedParams: "0x",
    },
    priceFeedMap: [
      {
        token: CONFIGURATOR,
        priceFeed: FEED,
        reserve: false,
        stalenessPeriod: 86400,
      },
    ],
    priceFeedTree: [
      {
        baseParams,
        description: "ETH / USD",
        updatable: true,
        decimals: 8,
        skipCheck: true,
        underlyingFeeds: [],
        underlyingStalenessPeriods: [],
        answer: { price, updatedAt: 1000n, success: true },
      },
    ],
  };
}

// SDK 12 shares its contract register by chain ID, including the RPC client.
let fixtureChainId = 10000;

function createFixture() {
  const calls: string[] = [];
  let blockNumber = 26237140n;
  let price = 2000_00000000n;
  const client = createPublicClient({
    chain: { ...chains.Mainnet, id: fixtureChainId++ },
    cacheTime: 0,
    transport: custom(
      {
        async request({ method, params }) {
          if (method === "eth_getBlockByNumber") {
            return {
              number: `0x${blockNumber.toString(16)}`,
              timestamp: "0x3e8",
              transactions: [],
            };
          }
          if (method === "eth_getLogs") return [];
          if (method === "eth_call" && Array.isArray(params)) {
            const data = params[0]?.data;
            if (!isHex(data)) throw new Error("missing calldata");
            if (data.startsWith("0x82ad56cb")) {
              const decoded = decodeFunctionData({ abi: multicall3Abi, data });
              if (decoded.functionName !== "aggregate3")
                throw new Error("unexpected multicall");
              calls.push("getPriceOracleState");
              const timestampAbi = parseAbi([
                "function getCurrentBlockTimestamp() view returns (uint256)",
                "function getBlockNumber() view returns (uint256)",
              ]);
              return encodeFunctionResult({
                abi: multicall3Abi,
                functionName: "aggregate3",
                result: decoded.args[0].map((_, index) => ({
                  success: true,
                  returnData:
                    index === 0
                      ? encodeFunctionResult({
                          abi: timestampAbi,
                          functionName: "getCurrentBlockTimestamp",
                          result: 1000n,
                        })
                      : index === 1
                        ? encodeFunctionResult({
                            abi: timestampAbi,
                            functionName: "getBlockNumber",
                            result: blockNumber,
                          })
                        : encodeFunctionResult({
                            abi: priceFeedCompressorAbi,
                            functionName: "getPriceOracleState",
                            result: oracleState(price),
                          }),
                })),
              });
            }

            if (
              data.startsWith(
                encodeFunctionData({
                  abi: priceFeedCompressorAbi,
                  functionName: "getPriceOracleState",
                  args: [CONFIGURATOR],
                }).slice(0, 10),
              )
            ) {
              calls.push("getPriceOracleState");
              return encodeFunctionResult({
                abi: priceFeedCompressorAbi,
                functionName: "getPriceOracleState",
                result: oracleState(price),
              });
            }

            if (
              data.startsWith(
                encodeFunctionData({
                  abi: iAddressProviderV310Abi,
                  functionName: "getAllEntries",
                }).slice(0, 10),
              )
            ) {
              return encodeFunctionResult({
                abi: iAddressProviderV310Abi,
                functionName: "getAllEntries",
                result: [],
              });
            }
            if (
              data.startsWith(
                encodeFunctionData({
                  abi: priceFeedCompressorAbi,
                  functionName: "getUpdatablePriceFeeds",
                  args: [
                    { configurators: [], pools: [], underlying: CONFIGURATOR },
                  ],
                }).slice(0, 10),
              )
            ) {
              calls.push("getUpdatablePriceFeeds");
              return encodeFunctionResult({
                abi: priceFeedCompressorAbi,
                functionName: "getUpdatablePriceFeeds",
                result: [baseParams],
              });
            }
            if (
              data.startsWith(
                encodeFunctionData({
                  abi: marketCompressorAbi,
                  functionName: "getMarkets",
                  args: [
                    { configurators: [], pools: [], underlying: CONFIGURATOR },
                  ],
                }).slice(0, 10),
              )
            ) {
              calls.push("getMarkets");
              return encodeFunctionResult({
                abi: marketCompressorAbi,
                functionName: "getMarkets",
                result: [
                  {
                    ...REDSTONE_MARKET,
                    configurator: CONFIGURATOR,
                    priceOracle: oracleState(price),
                    tokens: [
                      ...REDSTONE_MARKET.tokens,
                      {
                        addr: CONFIGURATOR,
                        symbol: "ETH",
                        name: "Ether",
                        decimals: 18,
                      },
                    ],
                  },
                ],
              });
            }
          }
          throw new Error(`unexpected RPC: ${method}`);
        },
      },
      { retryCount: 0 },
    ),
  });
  return {
    client,
    calls,
    advanceBlock: () => {
      blockNumber++;
      price += 100_00000000n;
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("SDK without RedStone updates", () => {
  it("loads markets containing RedStone feeds even when public gateways reject requests", async () => {
    const { client, calls } = createFixture();
    const sdk = await GearboxSDK.attach({
      client,
      networkType: "Mainnet",
      marketConfigurators: [CONFIGURATOR],
    });
    expect(sdk.marketRegister.marketFilter.configurators).toEqual([
      CONFIGURATOR,
    ]);
    expect(calls).toEqual(["getMarkets"]);
    expect(fetchRedstonePayloads).not.toHaveBeenCalled();
    expect(await sdk.priceFeeds.generatePriceFeedsUpdateTxs()).toEqual({
      txs: [],
      timestamp: 0,
    });
  });

  it("syncs and reloads markets with legacy historical RedStone settings", async () => {
    const { client, calls, advanceBlock } = createFixture();
    const sdk = await GearboxSDK.attach({
      client,
      networkType: "Mainnet",
      marketConfigurators: [CONFIGURATOR],
      redstone: { historicTimestamp: true, ignoreMissingFeeds: true },
    });
    vi.spyOn(
      sdk.marketRegister.marketConfigurators[0],
      "dirty",
      "get",
    ).mockReturnValue(true);
    advanceBlock();
    expect(await sdk.syncState()).toBe(true);
    expect(calls).toEqual(["getMarkets", "getMarkets"]);
  });

  it("refreshes loaded market prices through SDK sync on successive clean blocks", async () => {
    const { client, calls, advanceBlock } = createFixture();
    const sdk = await GearboxSDK.attach({
      client,
      networkType: "Mainnet",
      marketConfigurators: [CONFIGURATOR],
    });
    const market = sdk.marketRegister.markets[0];
    expect(market.priceOracle.mainPrice(CONFIGURATOR)).toBe(2000_00000000n);
    for (const expectedPrice of [2100_00000000n, 2200_00000000n]) {
      advanceBlock();
      expect(await sdk.syncState()).toBe(true);
      expect(market.priceOracle.mainPrice(CONFIGURATOR)).toBe(expectedPrice);
      expect(sdk.priceFeeds.mustGet(FEED).answer.price).toBe(expectedPrice);
    }
    expect(calls).toEqual([
      "getMarkets",
      "getPriceOracleState",
      "getPriceOracleState",
    ]);
    expect(fetchRedstonePayloads).not.toHaveBeenCalled();
  });

  it("returns no external or permissionless updates without compressor calls", async () => {
    const { client, calls } = createFixture();
    const sdk = await GearboxSDK.attach({
      client,
      networkType: "Mainnet",
      marketConfigurators: [CONFIGURATOR],
    });
    expect(
      await sdk.priceFeeds.generateExternalPriceFeedsUpdateTxs([FEED]),
    ).toEqual({ txs: [], timestamp: 0 });
    expect(
      await sdk.priceFeeds.generateExternalPriceFeedsUpdates([FEED]),
    ).toEqual([]);
    expect(
      await getUpdatablePriceFeeds({
        sdk,
        client,
        pfCompressor: CONFIGURATOR,
        priceFeeds: [FEED],
      }),
    ).toEqual([]);
    expect(
      await new RedstoneUpdater(sdk, { historicTimestamp: true }).getUpdateTxs(
        [],
      ),
    ).toEqual([]);
    expect(calls).toEqual(["getMarkets"]);
    expect(fetchRedstonePayloads).not.toHaveBeenCalled();
  });

  it("keeps RedStone state readable but excludes it from update dependencies", () => {
    const { client } = createFixture();
    const feed = new RedstonePriceFeedContract(
      { client },
      {
        baseParams,
        description: "ETH / USD",
        updatable: true,
        decimals: 8,
        skipCheck: true,
        underlyingFeeds: [],
        underlyingStalenessPeriods: [],
        answer: { price: 2000_00000000n, updatedAt: 1000n, success: true },
      },
    );
    expect(feed.dataId).toBe("ETH");
    expect(feed.lastPrice).toBe(2000_00000000n);
    expect(feed.stateHuman().contractType).toBe("PRICE_FEED::REDSTONE");
    expect(feed.updatable).toBe(false);
    expect(feed.updatableDependencies()).toEqual([]);
  });
});
