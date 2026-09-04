import type { Address } from "viem";
import { parseEther } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Token, TokenAmount } from "../../../model/index.js";
import { NATIVE_ADDRESS } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { CBETH, CM, NATIVE, OWNER, SPENDER, WETH } from "../testing/tokens.js";
import type { CollateralFundingPreview } from "./checkCollateralFunding.js";
import { checkCollateralFunding } from "./checkCollateralFunding.js";

const readContract = vi.fn();
const getBalance = vi.fn();
const getApprovalAddress = vi.fn();
const getAddress = vi.fn();

const TOKENS: Record<string, Token> = {
  [WETH.address.toLowerCase()]: WETH,
  [CBETH.address.toLowerCase()]: CBETH,
  [NATIVE_ADDRESS.toLowerCase()]: NATIVE,
};

function sdk(): OnchainSDK {
  return {
    chainId: 1,
    client: { readContract, getBalance },
    accounts: { getApprovalAddress },
    addressProvider: { getAddress },
    tokensMeta: {
      getToken: (address: Address) => TOKENS[address.toLowerCase()],
    },
  } as unknown as OnchainSDK;
}

function amount(token: Token, value: bigint): TokenAmount {
  return { token, value, valueUsd: null };
}

function opening(collateralAdded: TokenAmount[]): CollateralFundingPreview {
  return {
    operation: "OpenCreditAccount",
    creditManager: CM,
    collateralAdded,
  } as CollateralFundingPreview;
}

function adjust(
  collateralAdded: TokenAmount[],
  creditAccount: Address,
): CollateralFundingPreview {
  return {
    operation: "AdjustCreditAccount",
    creditManager: CM,
    creditAccount,
    collateralAdded,
  } as CollateralFundingPreview;
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
    native: getBalance.mock.calls.map(([c]) => c.address as Address),
  };
}

describe("checkCollateralFunding", () => {
  beforeEach(() => {
    readContract.mockReset();
    getBalance.mockReset();
    getApprovalAddress.mockReset();
    getAddress.mockReset();
  });
  it("returns nothing and reads nothing when no collateral was added", async () => {
    expect(
      await checkCollateralFunding({
        sdk: sdk(),
        preview: opening([]),
        sender: OWNER,
      }),
    ).toEqual([]);
    expect(getApprovalAddress).not.toHaveBeenCalled();
    expect(readContract).not.toHaveBeenCalled();
    expect(getBalance).not.toHaveBeenCalled();
  });

  it("requires full WETH allowance and balance with no native value", async () => {
    getApprovalAddress.mockResolvedValueOnce(SPENDER);
    getAddress.mockReturnValueOnce(WETH.address);
    readContract.mockResolvedValue(parseEther("1"));

    const errors = await checkCollateralFunding({
      sdk: sdk(),
      preview: opening([amount(WETH, parseEther("1"))]),
      sender: OWNER,
    });

    expect(errors).toEqual([]);
    expect(getApprovalAddress).toHaveBeenCalledWith({
      creditManager: CM,
      borrower: OWNER,
    });
    const { balances, allowances, native } = reads();
    expect(native).toEqual([]);
    expect(balances).toEqual([{ token: WETH.address, owner: OWNER }]);
    expect(allowances).toEqual([
      { token: WETH.address, owner: OWNER, spender: SPENDER },
    ]);
  });

  it("leaves a native balance and a WETH allowance when value covers the collateral", async () => {
    getApprovalAddress.mockResolvedValueOnce(SPENDER);
    getAddress.mockReturnValueOnce(WETH.address);
    getBalance.mockResolvedValueOnce(parseEther("2"));
    readContract.mockResolvedValue(parseEther("1"));

    const errors = await checkCollateralFunding({
      sdk: sdk(),
      preview: opening([amount(NATIVE, parseEther("1"))]),
      sender: OWNER,
    });

    expect(errors).toEqual([]);
    const { balances, allowances, native } = reads();
    expect(native).toEqual([OWNER]);
    expect(balances).toEqual([]);
    expect(allowances).toEqual([
      { token: WETH.address, owner: OWNER, spender: SPENDER },
    ]);
  });

  it("splits the WETH balance when value only partially covers the collateral", async () => {
    getApprovalAddress.mockResolvedValueOnce(SPENDER);
    getAddress.mockReturnValueOnce(WETH.address);
    getBalance.mockResolvedValueOnce(parseEther("0.4"));
    readContract.mockImplementation(async ({ functionName, address }) => {
      if (functionName === "balanceOf") {
        expect(address).toBe(WETH.address);
        return parseEther("0.6");
      }
      return parseEther("1");
    });

    const errors = await checkCollateralFunding({
      sdk: sdk(),
      preview: opening([
        amount(NATIVE, parseEther("0.4")),
        amount(WETH, parseEther("0.6")),
      ]),
      sender: OWNER,
    });

    expect(errors).toEqual([]);
    const { balances, allowances, native } = reads();
    expect(native).toEqual([OWNER]);
    expect(balances).toEqual([{ token: WETH.address, owner: OWNER }]);
    expect(allowances).toEqual([
      { token: WETH.address, owner: OWNER, spender: SPENDER },
    ]);
  });

  it("reports a native balance that cannot cover the attached value", async () => {
    getApprovalAddress.mockResolvedValueOnce(SPENDER);
    getAddress.mockReturnValueOnce(WETH.address);
    getBalance.mockResolvedValueOnce(parseEther("0.5"));
    readContract.mockResolvedValue(parseEther("1"));

    const errors = await checkCollateralFunding({
      sdk: sdk(),
      preview: opening([amount(NATIVE, parseEther("1"))]),
      sender: OWNER,
    });

    expect(errors).toMatchObject([
      {
        code: "insufficientBalance",
        required: { token: NATIVE, value: parseEther("1") },
        held: { token: NATIVE, value: parseEther("0.5") },
      },
    ]);
  });

  it("does not offset non-WETH collateral by the attached value", async () => {
    getApprovalAddress.mockResolvedValueOnce(SPENDER);
    getAddress.mockReturnValueOnce(WETH.address);
    getBalance.mockResolvedValueOnce(parseEther("1"));
    readContract.mockResolvedValue(parseEther("2"));

    const errors = await checkCollateralFunding({
      sdk: sdk(),
      preview: opening([
        amount(NATIVE, parseEther("1")),
        amount(CBETH, parseEther("2")),
      ]),
      sender: OWNER,
    });

    expect(errors).toEqual([]);
    const { balances, allowances, native } = reads();
    expect(native).toEqual([OWNER]);
    expect(balances).toEqual([{ token: CBETH.address, owner: OWNER }]);
    expect(allowances).toEqual(
      expect.arrayContaining([
        { token: WETH.address, owner: OWNER, spender: SPENDER },
        { token: CBETH.address, owner: OWNER, spender: SPENDER },
      ]),
    );
    expect(allowances).toHaveLength(2);
  });

  it("resolves the spender with creditAccount on adjust", async () => {
    const creditAccount =
      "0x1234123412341234123412341234123412341234" as Address;
    getApprovalAddress.mockResolvedValueOnce(SPENDER);
    getAddress.mockReturnValueOnce(WETH.address);
    readContract.mockResolvedValue(parseEther("1"));

    await checkCollateralFunding({
      sdk: sdk(),
      preview: adjust([amount(WETH, parseEther("1"))], creditAccount),
      sender: OWNER,
    });

    expect(getApprovalAddress).toHaveBeenCalledWith({
      creditManager: CM,
      creditAccount,
    });
  });

  it("reports unexpectedFailure when getApprovalAddress throws", async () => {
    const cause = new Error("unknown credit manager");
    getApprovalAddress.mockRejectedValueOnce(cause);

    expect(
      await checkCollateralFunding({
        sdk: sdk(),
        preview: opening([amount(WETH, parseEther("1"))]),
        sender: OWNER,
      }),
    ).toEqual([
      {
        code: "unexpectedFailure",
        message:
          "The SDK could not resolve the approval address: unknown credit manager",
        cause,
      },
    ]);
  });
});
