import type { Address, Hex } from "viem";
import { encodeFunctionData, getAddress, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { ierc4626AdapterAbi } from "../../abi/ierc4626Adapter.js";
import {
  AbstractAdapterContract,
  ERC4626AdapterContract,
  type SdkWithAdapters,
} from "../../plugins/adapters/index.js";
import {
  type Asset,
  AssetsMap,
  MAX_UINT256,
  MIN_INT96,
} from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";
import {
  applyInnerOperations,
  type InnerOperationsState,
  makeInnerOperationsState,
} from "./applyInnerOperations.js";
import { applyQuotaChanges } from "./applyQuotaChanges.js";
import {
  ERROR_ADAPTER_CALL_OUTSIDE_BRACKET,
  ERROR_MALFORMED_BRACKET,
  ERROR_NON_ADAPTER_CALL_IN_BRACKET,
  ERROR_UNPREVIEWABLE_ADAPTER_CALL,
  ERROR_UNPREVIEWABLE_RWA_WRAP_UNWRAP,
  type OperationPreviewError,
} from "./types.js";

const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const WSTETH = getAddress("0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0");
const ADAPTER = getAddress("0x1111111111111111111111111111111111111111");
const RECEIVER = getAddress("0x2222222222222222222222222222222222222222");
// RWA vault share token (an RWA underlying) for the wrap/unwrap exception
const RWA_SHARE = getAddress("0x50A9C808cd114E8fEA72f03aE2B1A8825677D56D");

/**
 * Stub adapter created via the prototype so `instanceof
 * AbstractAdapterContract` holds without going through the constructor.
 * `previewBalanceChanges` mimics a diff-style call: spends `tokenIn` down to
 * the given leftover.
 */
function stubAdapter(tokenIn: Address, leftover: bigint) {
  const adapter: AbstractAdapterContract<[], []> = Object.create(
    AbstractAdapterContract.prototype,
  );
  adapter.previewBalanceChanges = async (
    balances: AssetsMap,
    _calldata: Hex,
  ) => {
    balances.upsert(tokenIn, leftover);
  };
  return adapter;
}

/**
 * Stub adapter whose `previewBalanceChanges` throws, mimicking undecodable
 * calldata or an unsupported adapter function.
 */
function stubThrowingAdapter(message: string) {
  const adapter: AbstractAdapterContract<[], []> = Object.create(
    AbstractAdapterContract.prototype,
  );
  adapter.previewBalanceChanges = async () => {
    throw new Error(message);
  };
  return adapter;
}

/**
 * Stub ERC4626 adapter created via the prototype so `instanceof
 * ERC4626AdapterContract` holds. `asset`/`share` are prototype getters backed
 * by private fields, so they are shadowed with own properties.
 */
function stubRWAAdapter(asset: Address, share: Address) {
  const adapter: ERC4626AdapterContract = Object.create(
    ERC4626AdapterContract.prototype,
  );
  Object.defineProperty(adapter, "asset", { value: asset });
  Object.defineProperty(adapter, "share", { value: share });
  return adapter;
}

function stubSdk(
  contracts: Record<Address, unknown> = {},
  rwaUnderlyings: Address[] = [],
): SdkWithAdapters {
  return {
    getContract: (address: Address) => contracts[address],
    tokensMeta: {
      get: (address: Address) =>
        rwaUnderlyings.includes(address) ? { addr: address } : undefined,
      isRWAUnderlying: () => true,
    },
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
    version: 310,
    adapterFunctionName: "test",
    adapterArgs: {},
    calldata,
  };
}

interface ApplyResult {
  state: InnerOperationsState;
  error?: OperationPreviewError;
}

async function apply(
  multicall: InnerOperation[],
  state: InnerOperationsState = makeInnerOperationsState(),
  sdk: SdkWithAdapters = stubSdk(),
): Promise<ApplyResult> {
  const error = await applyInnerOperations(sdk, multicall, state);
  return { state, error };
}

/** Seeds a zeroed state with balances, debt and total debt. */
function seededState(
  balances: Asset[],
  debt: bigint,
  accrued: bigint,
): InnerOperationsState {
  const state = makeInnerOperationsState();
  for (const { token, balance } of balances) {
    state.balances.upsert(token, balance);
  }
  state.debt = debt;
  state.totalDebt = debt + accrued;
  return state;
}

describe("applyInnerOperations on zero-seeded state", () => {
  it("addCollateral increments balances and collateralAdded", async () => {
    const { state } = await apply([
      { operation: "AddCollateral", token: USDC, amount: 100n },
      { operation: "AddCollateral", token: USDC, amount: 50n },
    ]);
    expect(state.balances.get(USDC)).toBe(150n);
    expect(state.collateralAdded.get(USDC)).toBe(150n);
    expect(state.collateralWithdrawn.size).toBe(0);
  });

  it("increaseDebt increases debt, totalDebt and underlying balance", async () => {
    const { state } = await apply([
      { operation: "IncreaseBorrowedAmount", token: USDC, amount: 1000n },
    ]);
    expect(state.debt).toBe(1000n);
    expect(state.totalDebt).toBe(1000n);
    expect(state.balances.get(USDC)).toBe(1000n);
  });

  it("withdrawCollateral with explicit amount decrements balances and increments collateralWithdrawn", async () => {
    const { state } = await apply([
      { operation: "AddCollateral", token: WETH, amount: 100n },
      {
        operation: "WithdrawCollateral",
        token: WETH,
        amount: 30n,
        to: RECEIVER,
      },
    ]);
    expect(state.balances.get(WETH)).toBe(70n);
    expect(state.collateralWithdrawn.get(WETH)).toBe(30n);
  });

  it("updateQuota appends one quotaChanges entry per op", async () => {
    const { state } = await apply([
      { operation: "UpdateQuota", token: WETH, change: 100n },
      { operation: "UpdateQuota", token: USDC, change: -50n },
    ]);
    expect(state.quotaChanges).toEqual([
      { token: WETH, balance: 100n },
      { token: USDC, balance: -50n },
    ]);
  });

  it("bracket: storeExpectedBalances applies deltas, Execute threads leftovers, compareBalances changes nothing", async () => {
    const sdk = stubSdk({ [ADAPTER]: stubAdapter(WETH, 1n) });
    const { state, error } = await apply(
      [
        { operation: "AddCollateral", token: WETH, amount: 100n },
        {
          operation: "StoreExpectedBalances",
          deltas: [{ token: WSTETH, balance: 90n }],
        },
        execute(),
        { operation: "CompareBalances" },
      ],
      makeInnerOperationsState(),
      sdk,
    );
    expect(error).toBeUndefined();
    // delta applied for the target token
    expect(state.balances.get(WSTETH)).toBe(90n);
    // diff-style adapter spent WETH down to 1 wei leftover
    expect(state.balances.get(WETH)).toBe(1n);
  });
});

describe("applyInnerOperations on non-zero seeded state", () => {
  it("withdrawCollateral(MAX_UINT256) withdraws the full running balance", async () => {
    const { state } = await apply(
      [
        {
          operation: "WithdrawCollateral",
          token: WETH,
          amount: MAX_UINT256,
          to: RECEIVER,
        },
      ],
      seededState(
        [
          { token: WETH, balance: 75n },
          { token: USDC, balance: 500n },
        ],
        0n,
        0n,
      ),
    );
    expect(state.balances.get(WETH)).toBe(0n);
    expect(state.collateralWithdrawn.get(WETH)).toBe(75n);
    // seeded token not touched by any op passes through unchanged
    expect(state.balances.get(USDC)).toBe(500n);
  });

  it("decreaseDebt(MAX_UINT256) with accrued interest repays totalDebt and zeroes principal", async () => {
    const { state } = await apply(
      [
        {
          operation: "DecreaseBorrowedAmount",
          token: USDC,
          amount: MAX_UINT256,
        },
      ],
      seededState([{ token: USDC, balance: 1200n }], 1000n, 100n),
    );
    // underlying drops by totalDebt = 1100, not by principal
    expect(state.balances.get(USDC)).toBe(100n);
    expect(state.debt).toBe(0n);
    expect(state.totalDebt).toBe(0n);
  });

  it("partial decreaseDebt with amount <= accrued leaves principal unchanged", async () => {
    const { state } = await apply(
      [{ operation: "DecreaseBorrowedAmount", token: USDC, amount: 80n }],
      seededState(
        [
          { token: USDC, balance: 1200n },
          { token: WSTETH, balance: 7n },
        ],
        1000n,
        100n,
      ),
    );
    expect(state.balances.get(USDC)).toBe(1120n);
    expect(state.debt).toBe(1000n);
    expect(state.totalDebt).toBe(1020n);
    // seeded token not touched by any op passes through unchanged
    expect(state.balances.get(WSTETH)).toBe(7n);
  });

  it("partial decreaseDebt with amount > accrued reduces principal by the remainder", async () => {
    const { state } = await apply(
      [{ operation: "DecreaseBorrowedAmount", token: USDC, amount: 300n }],
      seededState([{ token: USDC, balance: 1200n }], 1000n, 100n),
    );
    expect(state.balances.get(USDC)).toBe(900n);
    // 100 repays accrued interest/fees, 200 repays principal
    expect(state.debt).toBe(800n);
    expect(state.totalDebt).toBe(800n);
  });

  it("bracket on pre-existing balances: delta on top of seeded target, leftover overwrites seeded input", async () => {
    const sdk = stubSdk({ [ADAPTER]: stubAdapter(WETH, 1n) });
    const { state, error } = await apply(
      [
        {
          operation: "StoreExpectedBalances",
          deltas: [{ token: WSTETH, balance: 90n }],
        },
        execute(),
        { operation: "CompareBalances" },
      ],
      seededState(
        [
          { token: WETH, balance: 100n },
          { token: WSTETH, balance: 10n },
          { token: USDC, balance: 500n },
        ],
        0n,
        0n,
      ),
      sdk,
    );
    expect(error).toBeUndefined();
    // delta lands on top of the seeded target balance
    expect(state.balances.get(WSTETH)).toBe(100n);
    // diff semantics: input spent down to the calldata leftover regardless of
    // the seeded pre-balance
    expect(state.balances.get(WETH)).toBe(1n);
    // seeded token not touched by any op passes through unchanged
    expect(state.balances.get(USDC)).toBe(500n);
  });
});

describe("applyInnerOperations on malformed multicalls", () => {
  it("reports an error on a second storeExpectedBalances/compareBalances pair", async () => {
    const { error } = await apply([
      { operation: "StoreExpectedBalances", deltas: [] },
      { operation: "CompareBalances" },
      { operation: "StoreExpectedBalances", deltas: [] },
      { operation: "CompareBalances" },
    ]);
    expect(error).toEqual({
      code: ERROR_MALFORMED_BRACKET,
      message: expect.stringContaining("duplicate storeExpectedBalances"),
    });
  });

  it("reports an error on compareBalances without a preceding storeExpectedBalances", async () => {
    const { error } = await apply([{ operation: "CompareBalances" }]);
    expect(error).toEqual({
      code: ERROR_MALFORMED_BRACKET,
      message: expect.stringContaining(
        "compareBalances without a preceding storeExpectedBalances",
      ),
    });
  });

  it("reports an error on storeExpectedBalances without a matching compareBalances", async () => {
    const { error } = await apply([
      { operation: "StoreExpectedBalances", deltas: [] },
    ]);
    expect(error).toEqual({
      code: ERROR_MALFORMED_BRACKET,
      message: expect.stringContaining(
        "storeExpectedBalances without a matching compareBalances",
      ),
    });
  });

  it("reports an error on a bracketed call to a non-adapter target", async () => {
    const { error } = await apply([
      { operation: "StoreExpectedBalances", deltas: [] },
      execute(),
      { operation: "CompareBalances" },
    ]);
    expect(error).toEqual({
      code: ERROR_NON_ADAPTER_CALL_IN_BRACKET,
      message: expect.stringContaining("is not an adapter call"),
    });
  });

  it("reports an error when a bracketed adapter preview throws, with the adapter's message", async () => {
    const sdk = stubSdk({
      [ADAPTER]: stubThrowingAdapter("cannot decode selector 0xdeadbeef"),
    });
    const { error } = await apply(
      [
        { operation: "StoreExpectedBalances", deltas: [] },
        execute(),
        { operation: "CompareBalances" },
      ],
      makeInnerOperationsState(),
      sdk,
    );
    expect(error).toEqual({
      code: ERROR_UNPREVIEWABLE_ADAPTER_CALL,
      message: "cannot decode selector 0xdeadbeef",
    });
  });

  it("reports an error on an out-of-bracket adapter call that is not an RWA wrap/unwrap", async () => {
    const sdk = stubSdk({ [ADAPTER]: stubAdapter(WETH, 1n) });
    const { error } = await apply([execute()], makeInnerOperationsState(), sdk);
    expect(error).toEqual({
      code: ERROR_ADAPTER_CALL_OUTSIDE_BRACKET,
      message: expect.stringContaining("outside of"),
    });
  });

  it("does not report an error on an out-of-bracket RWA wrap/unwrap call", async () => {
    const sdk = stubSdk({ [ADAPTER]: stubRWAAdapter(USDC, RWA_SHARE) }, [
      RWA_SHARE,
    ]);
    const calldata = encodeFunctionData({
      abi: ierc4626AdapterAbi,
      functionName: "deposit",
      args: [100n, zeroAddress],
    });
    const { state, error } = await apply(
      [
        { operation: "AddCollateral", token: USDC, amount: 500n },
        execute(ADAPTER, calldata),
      ],
      makeInnerOperationsState(),
      sdk,
    );
    expect(error).toBeUndefined();
    // 1-to-1 wrap applied directly
    expect(state.balances.get(USDC)).toBe(400n);
    expect(state.balances.get(RWA_SHARE)).toBe(100n);
  });

  it("reports an error on an out-of-bracket RWA wrap/unwrap call with undecodable calldata", async () => {
    const sdk = stubSdk({ [ADAPTER]: stubRWAAdapter(USDC, RWA_SHARE) }, [
      RWA_SHARE,
    ]);
    const { error } = await apply(
      [execute(ADAPTER, "0xdeadbeef")],
      makeInnerOperationsState(),
      sdk,
    );
    expect(error).toEqual({
      code: ERROR_UNPREVIEWABLE_RWA_WRAP_UNWRAP,
      message: expect.any(String),
    });
  });

  it("keeps applying explicit facade ops after the error is recorded", async () => {
    const { state, error } = await apply([
      execute(),
      { operation: "AddCollateral", token: USDC, amount: 100n },
      { operation: "IncreaseBorrowedAmount", token: USDC, amount: 1000n },
      { operation: "UpdateQuota", token: WETH, change: 50n },
      {
        operation: "WithdrawCollateral",
        token: USDC,
        amount: 30n,
        to: RECEIVER,
      },
    ]);
    expect(error).toEqual({
      code: ERROR_ADAPTER_CALL_OUTSIDE_BRACKET,
      message: expect.stringContaining("outside of"),
    });
    expect(state.collateralAdded.get(USDC)).toBe(100n);
    expect(state.collateralWithdrawn.get(USDC)).toBe(30n);
    expect(state.debt).toBe(1000n);
    expect(state.totalDebt).toBe(1000n);
    expect(state.quotaChanges).toEqual([{ token: WETH, balance: 50n }]);
  });

  it("returns the first detected failure when several occur", async () => {
    const { error } = await apply([
      { operation: "CompareBalances" },
      { operation: "StoreExpectedBalances", deltas: [] },
    ]);
    expect(error).toEqual({
      code: ERROR_MALFORMED_BRACKET,
      message: expect.stringContaining(
        "compareBalances without a preceding storeExpectedBalances",
      ),
    });
  });
});

describe("applyQuotaChanges", () => {
  it("creates a quota on an unquoted token", () => {
    const { quotas, quotasChange } = applyQuotaChanges(new AssetsMap(), [
      { token: WETH, balance: 100n },
    ]);
    expect(quotas).toEqual([{ token: WETH, balance: 100n }]);
    expect(quotasChange).toEqual([{ token: WETH, balance: 100n }]);
  });

  it("adds a positive change to an existing quota", () => {
    const { quotas, quotasChange } = applyQuotaChanges(
      new AssetsMap([{ token: WETH, balance: 100n }]),
      [{ token: WETH, balance: 50n }],
    );
    expect(quotas).toEqual([{ token: WETH, balance: 150n }]);
    expect(quotasChange).toEqual([{ token: WETH, balance: 50n }]);
  });

  it("clamps at zero when the negative change exceeds the current quota", () => {
    const { quotas, quotasChange } = applyQuotaChanges(
      new AssetsMap([{ token: WETH, balance: 100n }]),
      [{ token: WETH, balance: -1000n }],
    );
    expect(quotas).toEqual([]);
    expect(quotasChange).toEqual([{ token: WETH, balance: -100n }]);
  });

  it("MIN_INT96 disables the quota regardless of its current value", () => {
    const { quotas, quotasChange } = applyQuotaChanges(
      new AssetsMap([
        { token: WETH, balance: 12345n },
        { token: USDC, balance: 500n },
      ]),
      [{ token: WETH, balance: MIN_INT96 }],
    );
    expect(quotas).toEqual([{ token: USDC, balance: 500n }]);
    expect(quotasChange).toEqual([{ token: WETH, balance: -12345n }]);
  });

  it("reported change equals post-clamp final minus initial", () => {
    const { quotas, quotasChange } = applyQuotaChanges(
      new AssetsMap([
        { token: WETH, balance: 100n },
        { token: USDC, balance: 200n },
      ]),
      [
        { token: WETH, balance: -300n },
        { token: WSTETH, balance: 40n },
      ],
    );
    expect(quotas).toEqual(
      expect.arrayContaining([
        { token: USDC, balance: 200n },
        { token: WSTETH, balance: 40n },
      ]),
    );
    expect(quotas).toHaveLength(2);
    expect(quotasChange).toEqual(
      expect.arrayContaining([
        { token: WETH, balance: -100n },
        { token: WSTETH, balance: 40n },
      ]),
    );
    expect(quotasChange).toHaveLength(2);
  });
});
