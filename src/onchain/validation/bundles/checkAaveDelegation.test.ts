import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { OWNER, POOL, SPENDER, UND } from "../testing/tokens.js";
import { checkAaveDelegation } from "./checkAaveDelegation.js";

const BRIDGE = SPENDER;
const DEBT_TOKEN = "0x2222222222222222222222222222222222222222" as Address;

const readContract = vi.fn();

function sdk(): OnchainSDK {
  return {
    chainId: 1,
    client: { readContract },
    tokensMeta: {
      getToken: (address: Address) =>
        address === UND.address ? UND : undefined,
    },
  } as unknown as OnchainSDK;
}

/** The bridge's pool, the reserve's variable debt token, then the delegation. */
function delegated(allowed: bigint): void {
  readContract
    .mockResolvedValueOnce(POOL)
    .mockResolvedValueOnce({ variableDebtTokenAddress: DEBT_TOKEN })
    .mockResolvedValueOnce(allowed);
}

const borrow = {
  bridge: BRIDGE,
  amount: { token: UND, value: 100n, valueUsd: null },
};

describe("checkAaveDelegation", () => {
  beforeEach(() => {
    readContract.mockReset();
  });

  it("passes at exactly the borrowed amount", async () => {
    delegated(100n);
    expect(
      await checkAaveDelegation({ sdk: sdk(), owner: OWNER, borrow }),
    ).toEqual([]);
  });

  it("names owner, bridge, debt token, required and delegated", async () => {
    delegated(1n);
    expect(
      await checkAaveDelegation({ sdk: sdk(), owner: OWNER, borrow }),
    ).toEqual([
      {
        code: "insufficientBorrowAllowance",
        message: expect.any(String),
        owner: OWNER,
        spender: BRIDGE,
        debtToken: DEBT_TOKEN,
        required: borrow.amount,
        allowed: { token: UND, value: 1n, valueUsd: null },
      },
    ]);
  });

  it("reads the reserve of the borrowed token in the bridge's pool, and the owner's delegation to the bridge", async () => {
    delegated(100n);
    await checkAaveDelegation({
      sdk: sdk(),
      owner: OWNER,
      borrow,
      blockNumber: 42n,
    });
    expect(readContract.mock.calls.map(([c]) => c)).toEqual([
      expect.objectContaining({
        address: BRIDGE,
        functionName: "pool",
        blockNumber: 42n,
      }),
      expect.objectContaining({
        address: POOL,
        functionName: "getReserveData",
        args: [UND.address],
        blockNumber: 42n,
      }),
      expect.objectContaining({
        address: DEBT_TOKEN,
        functionName: "borrowAllowance",
        args: [OWNER, BRIDGE],
        blockNumber: 42n,
      }),
    ]);
  });

  it("reports unexpectedFailure when a read reverts", async () => {
    const cause = new Error("revert");
    readContract.mockRejectedValueOnce(cause);
    expect(
      await checkAaveDelegation({ sdk: sdk(), owner: OWNER, borrow }),
    ).toEqual([
      {
        code: "unexpectedFailure",
        message: "The SDK could not read the UND borrow delegation: revert",
        cause,
      },
    ]);
  });
});
