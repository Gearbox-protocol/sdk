import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { MAX_UINT256, MIN_INT96 } from "../../onchain/index.js";
import { MockTokens } from "../../onchain/market/oracle/TestPriceOracle.mock.js";
import type { InnerOperation } from "../parse/index.js";
import { classifyCloseOrRepay, isCloseOrRepay } from "./detectCloseOrRepay.js";

const { WETH: UNDERLYING, cbETH: COLLATERAL, dcUSDC, USDC } = MockTokens;
const OWNER = "0xC32FEB4DBd127a1993478Ad6E5250710f838b908" as Address;

function decreaseDebt(amount: bigint): InnerOperation {
  return { operation: "DecreaseBorrowedAmount", token: UNDERLYING, amount };
}

function withdraw(token: Address, amount: bigint): InnerOperation {
  return { operation: "WithdrawCollateral", token, amount, to: OWNER };
}

function addCollateral(token: Address, amount: bigint): InnerOperation {
  return { operation: "AddCollateral", token, amount };
}

function disableQuota(token: Address): InnerOperation {
  return { operation: "UpdateQuota", token, change: MIN_INT96 };
}

/** Out-of-bracket RWA wrap/unwrap call: share -> asset */
function redeemDiff(): InnerOperation {
  return {
    operation: "Execute",
    adapter: "0x04Ac894088FdD6FD622d9fe7c39192baFaEA15db",
    adapterType: "ADAPTER::ERC4626_VAULT",
    version: 310,
    adapterFunctionName: "redeemDiff",
    adapterArgs: {},
    calldata: "0x0acb3202",
  };
}

function swapToUnderlyingBracket(): InnerOperation[] {
  return [
    {
      operation: "StoreExpectedBalances",
      deltas: [{ token: UNDERLYING, balance: 100n }],
    },
    {
      operation: "Execute",
      adapter: "0x7f961B7022ab3A3D7A3ABAe36697F134A915510F",
      adapterType: "ADAPTER::UNISWAP_V3_ROUTER",
      version: 310,
      adapterFunctionName: "exactAllInput",
      adapterArgs: {},
      calldata: "0x6161dc85",
    },
    { operation: "CompareBalances" },
  ];
}

// multicall assembled by assembleCloseCreditAccountCalls: swap everything to
// underlying, disable quotas, repay full debt, withdraw underlying
const closeShaped: InnerOperation[] = [
  ...swapToUnderlyingBracket(),
  disableQuota(COLLATERAL),
  decreaseDebt(MAX_UINT256),
  withdraw(UNDERLYING, MAX_UINT256),
];

// multicall assembled by assembleRepayCreditAccountCalls: top up underlying
// from the wallet, disable quotas, repay full debt, withdraw tokens in-kind
const repayShaped: InnerOperation[] = [
  addCollateral(UNDERLYING, 1000n),
  disableQuota(COLLATERAL),
  decreaseDebt(MAX_UINT256),
  withdraw(UNDERLYING, MAX_UINT256),
  withdraw(COLLATERAL, MAX_UINT256),
];

describe("isCloseOrRepay", () => {
  it("detects a close-shaped multicall", () => {
    expect(isCloseOrRepay(closeShaped)).toBe(true);
  });

  it("detects a repay-shaped multicall", () => {
    expect(isCloseOrRepay(repayShaped)).toBe(true);
  });

  it("detects full debt repayment that keeps positions", () => {
    expect(
      isCloseOrRepay([
        addCollateral(UNDERLYING, 1000n),
        decreaseDebt(MAX_UINT256),
      ]),
    ).toBe(true);
  });

  it("rejects an ordinary adjustment with explicit amounts", () => {
    expect(
      isCloseOrRepay([
        ...swapToUnderlyingBracket(),
        decreaseDebt(500n),
        withdraw(COLLATERAL, 100n),
        disableQuota(COLLATERAL),
      ]),
    ).toBe(false);
  });

  it("rejects full withdrawal without full debt repayment", () => {
    expect(
      isCloseOrRepay([decreaseDebt(500n), withdraw(COLLATERAL, MAX_UINT256)]),
    ).toBe(false);
  });

  it("rejects an empty multicall", () => {
    expect(isCloseOrRepay([])).toBe(false);
  });
});

describe("classifyCloseOrRepay", () => {
  it("classifies a swap-to-underlying multicall as close", () => {
    expect(classifyCloseOrRepay(closeShaped, [UNDERLYING])).toBe("close");
  });

  it("classifies as repay when collateral is added", () => {
    expect(classifyCloseOrRepay(repayShaped, [UNDERLYING])).toBe("repay");
  });

  it("classifies as repay when a non-exit token is withdrawn", () => {
    expect(
      classifyCloseOrRepay(
        [
          disableQuota(COLLATERAL),
          decreaseDebt(MAX_UINT256),
          withdraw(UNDERLYING, MAX_UINT256),
          withdraw(COLLATERAL, MAX_UINT256),
        ],
        [UNDERLYING],
      ),
    ).toBe("repay");
  });

  it("tie-breaks underlying-only multicall without adds as close", () => {
    expect(
      classifyCloseOrRepay(
        [decreaseDebt(MAX_UINT256), withdraw(UNDERLYING, MAX_UINT256)],
        [UNDERLYING],
      ),
    ).toBe("close");
  });

  // RWA claim tail assembled by the SDK: repay full debt, unwrap the
  // leftover RWA underlying (share -> asset) via redeemDiff and withdraw
  // the asset. Both the share and the asset are valid close exits.
  it("classifies withdrawal of the unwrapped RWA underlying as close", () => {
    expect(
      classifyCloseOrRepay(
        [
          disableQuota(COLLATERAL),
          decreaseDebt(MAX_UINT256),
          redeemDiff(),
          withdraw(USDC, MAX_UINT256),
        ],
        [dcUSDC, USDC],
      ),
    ).toBe("close");
  });

  it("classifies withdrawal of the RWA underlying share itself as close", () => {
    expect(
      classifyCloseOrRepay(
        [
          disableQuota(COLLATERAL),
          decreaseDebt(MAX_UINT256),
          withdraw(dcUSDC, MAX_UINT256),
        ],
        [dcUSDC, USDC],
      ),
    ).toBe("close");
  });

  it("classifies as repay when a non-exit token is withdrawn on a RWA market", () => {
    expect(
      classifyCloseOrRepay(
        [
          disableQuota(COLLATERAL),
          decreaseDebt(MAX_UINT256),
          withdraw(COLLATERAL, MAX_UINT256),
        ],
        [dcUSDC, USDC],
      ),
    ).toBe("repay");
  });

  it("classifies wallet-funded repay without withdrawals as repay", () => {
    expect(
      classifyCloseOrRepay(
        [addCollateral(UNDERLYING, 1000n), decreaseDebt(MAX_UINT256)],
        [UNDERLYING],
      ),
    ).toBe("repay");
  });

  it("classifies decreaseDebt(MAX) alone as repay", () => {
    expect(
      classifyCloseOrRepay([decreaseDebt(MAX_UINT256)], [UNDERLYING]),
    ).toBe("repay");
  });
});
