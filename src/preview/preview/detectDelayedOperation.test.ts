import type { Address, Hex } from "viem";
import { getAddress } from "viem";
import { describe, expect, it } from "vitest";
import {
  AbstractAdapterContract,
  type DelayedWithdrawalRequest,
  type SdkWithAdapters,
} from "../../plugins/adapters/index.js";
import {
  type Asset,
  encodeDelayedIntent,
  InvalidDelayedIntentError,
} from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";
import { detectDelayedOperation } from "./detectDelayedOperation.js";

const ADAPTER = getAddress("0x1111111111111111111111111111111111111111");
const OTHER_ADAPTER = getAddress("0x2222222222222222222222222222222222222222");
const PHANTOM = getAddress("0xF126EaCAcf6B14C8985fC195768A55E886Af4208");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const OWNER = getAddress("0xC32FEB4DBd127a1993478Ad6E5250710f838b908");

/**
 * Stub adapter created via the prototype so `instanceof
 * AbstractAdapterContract` holds without going through the constructor.
 * `parseDelayedWithdrawalRequest` returns the given request for any calldata.
 */
function stubAdapter(request?: DelayedWithdrawalRequest) {
  const adapter: AbstractAdapterContract<[], []> = Object.create(
    AbstractAdapterContract.prototype,
  );
  adapter.parseDelayedWithdrawalRequest = () => request;
  return adapter;
}

function stubSdk(contracts: Record<Address, unknown> = {}): SdkWithAdapters {
  return {
    getContract: (address: Address) => contracts[address],
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

/**
 * Wraps ops in a storeExpectedBalances/compareBalances bracket, the way the
 * withdrawal compressor emits request calls. By default the bracket declares
 * a positive phantom-token delta (partially delayed withdrawal).
 */
function bracket(
  ops: InnerOperation[],
  deltas: Asset[] = [{ token: PHANTOM, balance: 1000n }],
): InnerOperation[] {
  return [
    { operation: "StoreExpectedBalances", deltas },
    ...ops,
    { operation: "CompareBalances" },
  ];
}

describe("detectDelayedOperation", () => {
  it("returns undefined when the multicall has no Execute ops", () => {
    const result = detectDelayedOperation(stubSdk(), [
      { operation: "AddCollateral", token: USDC, amount: 100n },
    ]);
    expect(result).toBeUndefined();
  });

  it("returns undefined when no adapter reports a withdrawal request", () => {
    const result = detectDelayedOperation(
      stubSdk({ [ADAPTER]: stubAdapter(undefined) }),
      bracket([execute()]),
    );
    expect(result).toBeUndefined();
  });

  it("skips Execute ops whose target is not a known adapter", () => {
    const result = detectDelayedOperation(stubSdk(), bracket([execute()]));
    expect(result).toBeUndefined();
  });

  it("detects a request without extraData as intent: undefined (Mellow, legacy txs)", () => {
    const request: DelayedWithdrawalRequest = {
      phantomToken: PHANTOM,
      claimToken: USDC,
    };
    const result = detectDelayedOperation(
      stubSdk({ [ADAPTER]: stubAdapter(request) }),
      bracket([execute()]),
    );
    expect(result).toEqual({ request, intent: undefined });
  });

  it("detects a request with empty '0x' extraData as intent: undefined", () => {
    const request: DelayedWithdrawalRequest = {
      phantomToken: PHANTOM,
      claimToken: USDC,
      extraData: "0x",
    };
    const result = detectDelayedOperation(
      stubSdk({ [ADAPTER]: stubAdapter(request) }),
      bracket([execute()]),
    );
    expect(result).toEqual({ request, intent: undefined });
  });

  it("decodes a valid intent from extraData", () => {
    const request: DelayedWithdrawalRequest = {
      phantomToken: PHANTOM,
      claimToken: USDC,
      extraData: encodeDelayedIntent({ type: "CLOSE_ACCOUNT", to: OWNER }),
    };
    const result = detectDelayedOperation(
      stubSdk({ [ADAPTER]: stubAdapter(request) }),
      bracket([execute()]),
    );
    expect(result).toEqual({
      request,
      intent: { type: "CLOSE_ACCOUNT", to: OWNER },
    });
  });

  it("throws InvalidDelayedIntentError on non-empty undecodable extraData", () => {
    const request: DelayedWithdrawalRequest = {
      phantomToken: PHANTOM,
      claimToken: USDC,
      extraData: "0xdeadbeef",
    };
    expect(() =>
      detectDelayedOperation(
        stubSdk({ [ADAPTER]: stubAdapter(request) }),
        bracket([execute()]),
      ),
    ).toThrow(InvalidDelayedIntentError);
  });

  it("returns undefined when the bracket has no positive phantom delta (fully instant withdrawal)", () => {
    const request: DelayedWithdrawalRequest = {
      phantomToken: PHANTOM,
      claimToken: USDC,
      extraData: encodeDelayedIntent({ type: "CLOSE_ACCOUNT", to: OWNER }),
    };
    const result = detectDelayedOperation(
      stubSdk({ [ADAPTER]: stubAdapter(request) }),
      bracket([execute()], [{ token: USDC, balance: 1000n }]),
    );
    expect(result).toBeUndefined();
  });

  it("returns undefined when the request is outside any bracket", () => {
    const request: DelayedWithdrawalRequest = {
      phantomToken: PHANTOM,
      claimToken: USDC,
    };
    const result = detectDelayedOperation(
      stubSdk({ [ADAPTER]: stubAdapter(request) }),
      [execute()],
    );
    expect(result).toBeUndefined();
  });

  it("returns undefined when the phantom delta is in a different, already closed bracket", () => {
    const request: DelayedWithdrawalRequest = {
      phantomToken: PHANTOM,
      claimToken: USDC,
    };
    const result = detectDelayedOperation(
      stubSdk({ [ADAPTER]: stubAdapter(request) }),
      [
        ...bracket([]),
        ...bracket([execute()], [{ token: USDC, balance: 1000n }]),
      ],
    );
    expect(result).toBeUndefined();
  });

  it("returns the first matching request among several Execute ops", () => {
    const request: DelayedWithdrawalRequest = {
      phantomToken: PHANTOM,
      claimToken: USDC,
    };
    const result = detectDelayedOperation(
      stubSdk({
        [ADAPTER]: stubAdapter(undefined),
        [OTHER_ADAPTER]: stubAdapter(request),
      }),
      bracket([execute(ADAPTER), execute(OTHER_ADAPTER)]),
    );
    expect(result).toEqual({ request, intent: undefined });
  });
});
