import type { Address, Hex } from "viem";
import { custom, encodeFunctionResult, getAddress, zeroAddress } from "viem";
import { beforeEach, describe, expect, it } from "vitest";
import { iRedemptionLoggerV310Abi } from "../../abi/iRedemptionLoggerV310.js";
import {
  AbstractAdapterContract,
  type DelayedWithdrawalClaim,
  type SdkWithAdapters,
} from "../../plugins/adapters/index.js";
import {
  OnchainSDK,
  type RedemptionLog,
  RedemptionLoggerV310Contract,
} from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";
import { detectDelayedClaim } from "./detectDelayedClaim.js";

const ADAPTER = getAddress("0x1111111111111111111111111111111111111111");
const OTHER_ADAPTER = getAddress("0x2222222222222222222222222222222222222222");
const REDEEMER = getAddress("0x3333333333333333333333333333333333333333");
const LOGGER = getAddress("0x4444444444444444444444444444444444444444");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");

/**
 * Redemption log returned by the stubbed `eth_call` to the redemption
 * logger; mutated per test.
 */
let redemptionLog: RedemptionLog;
let ethCallCount = 0;

beforeEach(() => {
  redemptionLog = {
    creditAccount: zeroAddress,
    redeemer: zeroAddress,
    extraData: "0x",
  };
  ethCallCount = 0;
});

/**
 * Real SDK over a stub transport: `eth_call` responds with the current
 * `redemptionLog` encoded as the `redemptionLogs` result.
 */
const baseSdk = new OnchainSDK("Mainnet", {
  transport: custom({
    request: async ({ method }: { method: string }) => {
      if (method === "eth_call") {
        ethCallCount++;
        return encodeFunctionResult({
          abi: iRedemptionLoggerV310Abi,
          functionName: "redemptionLogs",
          result: redemptionLog,
        });
      }
      throw new Error(`unexpected request: ${method}`);
    },
  }),
});

/**
 * Stub adapter created via the prototype so `instanceof
 * AbstractAdapterContract` holds without going through the constructor.
 * `parseDelayedWithdrawalClaim` returns the given claim for any calldata.
 */
function stubAdapter(claim?: DelayedWithdrawalClaim) {
  const adapter: AbstractAdapterContract<[], []> = Object.create(
    AbstractAdapterContract.prototype,
  );
  adapter.parseDelayedWithdrawalClaim = () => claim;
  return adapter;
}

interface StubSdkOptions {
  contracts?: Record<Address, unknown>;
  /** Whether the redemption logger is deployed on the stub chain */
  logger?: boolean;
}

function stubSdk({ contracts = {}, logger }: StubSdkOptions): SdkWithAdapters {
  return {
    client: baseSdk.client,
    getContract: (address: Address) => contracts[address],
    redemptionLogger: logger
      ? new RedemptionLoggerV310Contract(baseSdk, LOGGER, 310)
      : undefined,
  } as unknown as SdkWithAdapters;
}

function execute(
  adapter: Address = ADAPTER,
  calldata: Hex = "0x",
): InnerOperation {
  return {
    operation: "Execute",
    adapter,
    adapterType: "ADAPTER::TEST",
    version: 311,
    adapterFunctionName: "test",
    adapterArgs: {},
    calldata,
  };
}

describe("detectDelayedClaim", () => {
  it("returns undefined when the multicall has no Execute ops", () => {
    const result = detectDelayedClaim(stubSdk({}), [
      { operation: "AddCollateral", token: USDC, amount: 100n },
    ]);
    expect(result).toBeUndefined();
  });

  it("returns undefined when no adapter reports a claim", () => {
    const result = detectDelayedClaim(
      stubSdk({ contracts: { [ADAPTER]: stubAdapter(undefined) } }),
      [execute()],
    );
    expect(result).toBeUndefined();
  });

  it("skips Execute ops whose target is not a known adapter", () => {
    const result = detectDelayedClaim(stubSdk({}), [execute()]);
    expect(result).toBeUndefined();
  });

  it("detects a claim and reports the adapter and the redeemer", () => {
    const result = detectDelayedClaim(
      stubSdk({
        contracts: { [ADAPTER]: stubAdapter({ redeemer: REDEEMER }) },
      }),
      [execute()],
    );
    expect(result).toEqual({ adapter: ADAPTER, redeemer: REDEEMER });
  });

  it("returns the first matching claim among several Execute ops", () => {
    const result = detectDelayedClaim(
      stubSdk({
        contracts: {
          [ADAPTER]: stubAdapter(undefined),
          [OTHER_ADAPTER]: stubAdapter({ redeemer: REDEEMER }),
        },
      }),
      [execute(ADAPTER), execute(OTHER_ADAPTER)],
    );
    expect(result).toEqual({ adapter: OTHER_ADAPTER, redeemer: REDEEMER });
  });
});
