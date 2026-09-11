import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NATIVE_ADDRESS } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { OWNER, TOK } from "../testing/tokens.js";
import { checkWalletBalance } from "./checkWalletBalance.js";

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

describe("checkWalletBalance", () => {
  beforeEach(() => {
    readContract.mockReset();
    getBalance.mockReset();
  });

  it("passes an ERC-20 balance that covers the amount", async () => {
    readContract.mockResolvedValueOnce(100n);
    expect(
      await checkWalletBalance({
        sdk: sdk(),
        token: TOK.address,
        holder: OWNER,
        required: 100n,
      }),
    ).toEqual([]);
  });

  it("reports insufficientBalance with holderKind wallet", async () => {
    readContract.mockResolvedValueOnce(1n);
    expect(
      await checkWalletBalance({
        sdk: sdk(),
        token: TOK.address,
        holder: OWNER,
        required: 100n,
      }),
    ).toEqual([
      {
        code: "insufficientBalance",
        message: expect.any(String),
        required: { token: TOK, value: 100n, valueUsd: null },
        held: { token: TOK, value: 1n, valueUsd: null },
        holderKind: "wallet",
        holder: OWNER,
      },
    ]);
  });

  it("reads native balance via getBalance, never balanceOf", async () => {
    getBalance.mockResolvedValueOnce(100n);
    expect(
      await checkWalletBalance({
        sdk: sdk(),
        token: NATIVE_ADDRESS,
        holder: OWNER,
        required: 100n,
      }),
    ).toEqual([]);
    expect(getBalance).toHaveBeenCalledWith({
      address: OWNER,
      blockNumber: undefined,
    });
    expect(readContract).not.toHaveBeenCalled();
  });

  it("reports unexpectedFailure when the read fails", async () => {
    const cause = new Error("rpc down");
    readContract.mockRejectedValueOnce(cause);
    expect(
      await checkWalletBalance({
        sdk: sdk(),
        token: TOK.address,
        holder: OWNER,
        required: 100n,
      }),
    ).toEqual([
      {
        code: "unexpectedFailure",
        message: `The SDK could not read the ${TOK.symbol} balance: rpc down`,
        cause,
      },
    ]);
  });
});
