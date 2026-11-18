import {
  type Address,
  type Chain,
  type PublicClient,
  stringToHex,
  type Transport,
} from "viem";
import { describe, expect, it } from "vitest";
import type { MarketSuite } from "../../../onchain/market/MarketSuite.js";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import { getTreasuryBalances } from "../state/configurator/getConfiguratorState.js";
import { getMarketState } from "../state/market/getMarketState.js";
import {
  CONFIGURATOR,
  CONTRACTS_REGISTER,
  createMarketSuite,
  createStubClient,
  createStubSdk,
  POOL,
  TREASURY,
  USDC,
} from "../testing/sdkHarness.js";

const ZAPPER: Address = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
const UNDEPLOYED: Address = "0x0000000000000000000000000000000000000abc";

describe("treasury balances of the configurator state", () => {
  it("reads what distribute would send for every pool token and underlying", async () => {
    const reads: string[] = [];
    const stub = {
      readContract: async ({ functionName }: { functionName: string }) => {
        reads.push(functionName);
        if (functionName === "contractsRegister") return CONTRACTS_REGISTER;
        if (functionName === "getPools") return [POOL];
        throw new Error(`unexpected ${functionName}`);
      },
      multicall: async ({
        contracts,
      }: {
        contracts: readonly { address: Address; functionName: string }[];
      }) =>
        contracts.map(call => {
          const token = call.address.toLowerCase();
          switch (call.functionName) {
            case "asset":
              return USDC;
            case "decimals":
              return 6;
            case "balanceOf":
              // the pool token is below its insurance amount
              return token === POOL ? 500_000n : 3_000_000n;
            case "tokenInsuranceAmount":
              return 1_000_000n;
            default:
              throw new Error(`unexpected ${call.functionName}`);
          }
        }),
    };
    // Only the two read methods the reader calls are stubbed.
    const client = stub as unknown as PublicClient<Transport, Chain>;

    const balances = await getTreasuryBalances({
      client,
      marketConfigurator: new MarketConfiguratorContract(CONFIGURATOR, client),
      treasurySplitter: TREASURY,
    });
    expect(balances).toEqual({
      [POOL]: { available: 0, insuranceAmount: 1 },
      [USDC]: { available: 2, insuranceAmount: 1 },
    });
  });
});

describe("periphery deployments in the market state", () => {
  it("reports a known, unregistered deployment that holds code as deployed", async () => {
    const client = createStubClient({
      multicall: call => {
        if (call.address?.toLowerCase() !== ZAPPER) return undefined;
        if (call.functionName === "contractType") {
          return {
            status: "success",
            result: stringToHex("ZAPPER::ERC4626_UNDERLYING", { size: 32 }),
          };
        }
        if (call.functionName === "version") {
          return { status: "success", result: 310n };
        }
        return undefined;
      },
      client: {
        getCode: async ({ address }: { address: Address }) =>
          address.toLowerCase() === ZAPPER ? "0x60" : "0x",
      },
    });
    const holder: { suite?: MarketSuite } = {};
    const sdk = createStubSdk({ client, marketSuite: holder });
    holder.suite = createMarketSuite({ client });

    const state = await getMarketState(sdk, CONFIGURATOR, POOL, {
      client,
      timestamp: 0,
      knownDeployments: [ZAPPER, UNDEPLOYED],
    });
    expect(state.periphery).toEqual([
      {
        address: ZAPPER,
        domain: "ZAPPER",
        type: "ZAPPER::ERC4626_UNDERLYING",
        version: 310,
        status: "deployed",
      },
    ]);
  });
});
