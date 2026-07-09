import type { Address, Hex } from "viem";
import { getAddress } from "viem";
import { describe, expect, it } from "vitest";
import {
  AbstractAdapterContract,
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
  applyQuotaChanges,
  type InnerOperationsState,
  makeInnerOperationsState,
} from "./applyInnerOperations.js";

const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const WSTETH = getAddress("0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0");
const ADAPTER = getAddress("0x1111111111111111111111111111111111111111");
const RECEIVER = getAddress("0x2222222222222222222222222222222222222222");

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
  adapter.previewBalanceChanges = (balances: AssetsMap, _calldata: Hex) => {
    balances.upsert(tokenIn, leftover);
  };
  return adapter;
}

function stubSdk(contracts: Record<Address, unknown> = {}): SdkWithAdapters {
  return {
    getContract: (address: Address) => contracts[address],
  } as unknown as SdkWithAdapters;
}

function execute(adapter: Address = ADAPTER): InnerOperation {
  return {
    operation: "Execute",
    adapter,
    adapterType: "ADAPTER::TEST",
    version: 310,
    adapterFunctionName: "test",
    adapterArgs: {},
    calldata: "0x",
  };
}

function apply(
  multicall: InnerOperation[],
  state: InnerOperationsState = makeInnerOperationsState(),
  sdk: SdkWithAdapters = stubSdk(),
): InnerOperationsState {
  applyInnerOperations(sdk, multicall, state);
  return state;
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
  it("addCollateral increments balances and collateralAdded", () => {
    const state = apply([
      { operation: "AddCollateral", token: USDC, amount: 100n },
      { operation: "AddCollateral", token: USDC, amount: 50n },
    ]);
    expect(state.balances.get(USDC)).toBe(150n);
    expect(state.collateralAdded.get(USDC)).toBe(150n);
    expect(state.collateralWithdrawn.size).toBe(0);
  });

  it("increaseDebt increases debt, totalDebt and underlying balance", () => {
    const state = apply([
      { operation: "IncreaseBorrowedAmount", token: USDC, amount: 1000n },
    ]);
    expect(state.debt).toBe(1000n);
    expect(state.totalDebt).toBe(1000n);
    expect(state.balances.get(USDC)).toBe(1000n);
  });

  it("withdrawCollateral with explicit amount decrements balances and increments collateralWithdrawn", () => {
    const state = apply([
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

  it("updateQuota appends one quotaChanges entry per op", () => {
    const state = apply([
      { operation: "UpdateQuota", token: WETH, change: 100n },
      { operation: "UpdateQuota", token: USDC, change: -50n },
    ]);
    expect(state.quotaChanges).toEqual([
      { token: WETH, balance: 100n },
      { token: USDC, balance: -50n },
    ]);
  });

  it("bracket: storeExpectedBalances applies deltas, Execute threads leftovers, compareBalances changes nothing", () => {
    const sdk = stubSdk({ [ADAPTER]: stubAdapter(WETH, 1n) });
    const state = apply(
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
    // delta applied for the target token
    expect(state.balances.get(WSTETH)).toBe(90n);
    // diff-style adapter spent WETH down to 1 wei leftover
    expect(state.balances.get(WETH)).toBe(1n);
  });
});

describe("applyInnerOperations on non-zero seeded state", () => {
  it("withdrawCollateral(MAX_UINT256) withdraws the full running balance", () => {
    const state = apply(
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

  it("decreaseDebt(MAX_UINT256) with accrued interest repays totalDebt and zeroes principal", () => {
    const state = apply(
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

  it("partial decreaseDebt with amount <= accrued leaves principal unchanged", () => {
    const state = apply(
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

  it("partial decreaseDebt with amount > accrued reduces principal by the remainder", () => {
    const state = apply(
      [{ operation: "DecreaseBorrowedAmount", token: USDC, amount: 300n }],
      seededState([{ token: USDC, balance: 1200n }], 1000n, 100n),
    );
    expect(state.balances.get(USDC)).toBe(900n);
    // 100 repays accrued interest/fees, 200 repays principal
    expect(state.debt).toBe(800n);
    expect(state.totalDebt).toBe(800n);
  });

  it("bracket on pre-existing balances: delta on top of seeded target, leftover overwrites seeded input", () => {
    const sdk = stubSdk({ [ADAPTER]: stubAdapter(WETH, 1n) });
    const state = apply(
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
  it("throws on duplicate storeExpectedBalances", () => {
    expect(() =>
      apply([
        { operation: "StoreExpectedBalances", deltas: [] },
        { operation: "CompareBalances" },
        { operation: "StoreExpectedBalances", deltas: [] },
        { operation: "CompareBalances" },
      ]),
    ).toThrow("duplicate storeExpectedBalances");
  });

  it("throws on compareBalances without a preceding storeExpectedBalances", () => {
    expect(() => apply([{ operation: "CompareBalances" }])).toThrow(
      "compareBalances without a preceding storeExpectedBalances",
    );
  });

  it("throws on storeExpectedBalances without a matching compareBalances", () => {
    expect(() =>
      apply([{ operation: "StoreExpectedBalances", deltas: [] }]),
    ).toThrow("storeExpectedBalances without a matching compareBalances");
  });

  it("throws on a bracketed call to a non-adapter target", () => {
    expect(() =>
      apply([
        { operation: "StoreExpectedBalances", deltas: [] },
        execute(),
        { operation: "CompareBalances" },
      ]),
    ).toThrow("is not an adapter call");
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
