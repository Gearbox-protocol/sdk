import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { OWNER, SPENDER, TOK } from "../testing/tokens.js";
import { checkWalletAllowance } from "./checkWalletAllowance.js";

const readContract = vi.fn();

function sdk(): OnchainSDK {
  return {
    chainId: 1,
    client: { readContract },
    tokensMeta: {
      getToken: (address: Address) =>
        address === TOK.address ? TOK : undefined,
    },
  } as unknown as OnchainSDK;
}

describe("checkWalletAllowance", () => {
  beforeEach(() => {
    readContract.mockReset();
  });

  it("passes at exactly the required allowance", async () => {
    readContract.mockResolvedValueOnce(100n);
    expect(
      await checkWalletAllowance({
        sdk: sdk(),
        token: TOK.address,
        owner: OWNER,
        spender: SPENDER,
        required: 100n,
      }),
    ).toEqual([]);
  });

  it("names owner, spender, required and allowed", async () => {
    readContract.mockResolvedValueOnce(1n);
    expect(
      await checkWalletAllowance({
        sdk: sdk(),
        token: TOK.address,
        owner: OWNER,
        spender: SPENDER,
        required: 100n,
      }),
    ).toEqual([
      {
        code: "insufficientAllowance",
        message: expect.any(String),
        owner: OWNER,
        spender: SPENDER,
        required: { token: TOK, value: 100n, valueUsd: null },
        allowed: { token: TOK, value: 1n, valueUsd: null },
      },
    ]);
  });

  it("reports unexpectedFailure when the read reverts", async () => {
    const cause = new Error("ERC20: revert");
    readContract.mockRejectedValueOnce(cause);
    expect(
      await checkWalletAllowance({
        sdk: sdk(),
        token: TOK.address,
        owner: OWNER,
        spender: SPENDER,
        required: 100n,
      }),
    ).toEqual([
      {
        code: "unexpectedFailure",
        message: `The SDK could not read the ${TOK.symbol} allowance: ERC20: revert`,
        cause,
      },
    ]);
  });

  it("forwards blockNumber to the read", async () => {
    readContract.mockResolvedValueOnce(100n);
    await checkWalletAllowance({
      sdk: sdk(),
      token: TOK.address,
      owner: OWNER,
      spender: SPENDER,
      required: 100n,
      blockNumber: 42n,
    });
    expect(readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "allowance",
        args: [OWNER, SPENDER],
        blockNumber: 42n,
      }),
    );
  });
});
