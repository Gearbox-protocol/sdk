import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { MAX_UINT256, MIN_INT96 } from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";
import { classifyCloseOrRepay, isCloseOrRepay } from "./detectCloseOrRepay.js";

const UNDERLYING: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
const COLLATERAL: Address = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704"; // cbETH
const dcUSDC: Address = "0x50A9C808cd114E8fEA72f03aE2B1A8825677D56D"; // Wrapped USDC used as RWA underlying
const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
const OWNER: Address = "0xC32FEB4DBd127a1993478Ad6E5250710f838b908";

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

  it("rejects full debt repayment that keeps positions", () => {
    expect(
      isCloseOrRepay([
        addCollateral(UNDERLYING, 1000n),
        decreaseDebt(MAX_UINT256),
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
});
