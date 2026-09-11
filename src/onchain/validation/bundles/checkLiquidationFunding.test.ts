import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LiquidationDetails, TokenAmount } from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { OWNER, SPENDER, TOK } from "../testing/tokens.js";
import { checkLiquidationFunding } from "./checkLiquidationFunding.js";

const readContract = vi.fn();
const getBalance = vi.fn();

function sdk(): OnchainSDK {
  return {
    chainId: 1,
    client: { readContract, getBalance },
    tokensMeta: {
      getToken: (address: Address) =>
        address === TOK.address ? TOK : undefined,
    },
  } as unknown as OnchainSDK;
}

function amount(value: bigint): TokenAmount {
  return { token: TOK, value, valueUsd: null };
}

function details(
  over: Partial<Pick<LiquidationDetails, "repaymentAmount" | "approve">> = {},
): LiquidationDetails {
  return {
    repaymentAmount: amount(0n),
    ...over,
  } as LiquidationDetails;
}

function reads() {
  return {
    balances: readContract.mock.calls
      .filter(([c]) => c.functionName === "balanceOf")
      .map(([c]) => ({ token: c.address as Address, owner: c.args[0] })),
    allowances: readContract.mock.calls
      .filter(([c]) => c.functionName === "allowance")
      .map(([c]) => ({
        token: c.address as Address,
        owner: c.args[0],
        spender: c.args[1],
      })),
  };
}

describe("checkLiquidationFunding", () => {
  beforeEach(() => {
    readContract.mockReset();
    getBalance.mockReset();
  });

  it("reads nothing when repayment is zero and there is no approve", async () => {
    expect(
      await checkLiquidationFunding({
        sdk: sdk(),
        details: details(),
        liquidator: OWNER,
      }),
    ).toEqual([]);
    expect(readContract).not.toHaveBeenCalled();
    expect(getBalance).not.toHaveBeenCalled();
  });

  it("weighs the balance against repaymentAmount only", async () => {
    readContract.mockResolvedValueOnce(0n);
    expect(
      await checkLiquidationFunding({
        sdk: sdk(),
        details: details({ repaymentAmount: amount(100n) }),
        liquidator: OWNER,
      }),
    ).toEqual([
      {
        code: "insufficientBalance",
        message: expect.any(String),
        required: { token: TOK, value: 100n, valueUsd: null },
        held: { token: TOK, value: 0n, valueUsd: null },
        holderKind: "wallet",
        holder: OWNER,
      },
    ]);
    expect(reads()).toEqual({
      balances: [{ token: TOK.address, owner: OWNER }],
      allowances: [],
    });
  });

  it("weighs the allowance against the buffered approve.value, not repayment", async () => {
    readContract.mockResolvedValue(0n);
    expect(
      await checkLiquidationFunding({
        sdk: sdk(),
        details: details({
          repaymentAmount: amount(100n),
          approve: { ...amount(105n), spender: SPENDER },
        }),
        liquidator: OWNER,
      }),
    ).toEqual([
      {
        code: "insufficientBalance",
        message: expect.any(String),
        required: { token: TOK, value: 100n, valueUsd: null },
        held: { token: TOK, value: 0n, valueUsd: null },
        holderKind: "wallet",
        holder: OWNER,
      },
      {
        code: "insufficientAllowance",
        message: expect.any(String),
        owner: OWNER,
        spender: SPENDER,
        required: { token: TOK, value: 105n, valueUsd: null },
        allowed: { token: TOK, value: 0n, valueUsd: null },
      },
    ]);
    expect(reads()).toEqual({
      balances: [{ token: TOK.address, owner: OWNER }],
      allowances: [{ token: TOK.address, owner: OWNER, spender: SPENDER }],
    });
  });
});
