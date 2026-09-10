import type { Address } from "viem";
import { getAddress } from "viem";
import { describe, expect, it } from "vitest";
import type { LiquidationDetails } from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { TOK } from "../testing/tokens.js";
import { checkLiquidationEligibility } from "./checkLiquidationEligibility.js";

const CREDIT_MANAGER = "0x00000000000000000000000000000000000000cd" as Address;
const CREDIT_ACCOUNT = "0x00000000000000000000000000000000000000ce" as Address;
/**
 * The register answers ABI-decoded, i.e. checksummed, while a connected wallet
 * arrives lowercased. Mixed case on exactly one side is what makes a
 * case-sensitive compare fail.
 */
const LIQUIDATOR = getAddress(
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
) as Address;
const LIQUIDATOR_LOWER = LIQUIDATOR.toLowerCase() as Address;
const STRANGER = "0x00000000000000000000000000000000000000ff" as Address;

function sdk(emergencyLiquidators: Address[] = []): OnchainSDK {
  return {
    marketRegister: {
      findByCreditManager: () => ({
        state: { emergencyLiquidators },
        isEmergencyLiquidator: (sender: Address) =>
          emergencyLiquidators.some(
            a => a.toLowerCase() === sender.toLowerCase(),
          ),
      }),
    },
  } as unknown as OnchainSDK;
}

function details(over: Partial<LiquidationDetails> = {}): LiquidationDetails {
  return {
    creditManager: CREDIT_MANAGER,
    creditAccount: CREDIT_ACCOUNT,
    paused: false,
    isCreditAccountFrozen: false,
    isLiquidatorEligible: true,
    ...over,
  } as unknown as LiquidationDetails;
}

const codesOf = (
  input: Parameters<typeof checkLiquidationEligibility>[0],
): string[] => checkLiquidationEligibility(input).map(e => e.code);

describe("checkLiquidationEligibility", () => {
  it("clears a wallet nothing is wrong with", () => {
    expect(
      codesOf({ sdk: sdk(), details: details(), liquidator: STRANGER }),
    ).toEqual([]);
  });

  it("refuses a frozen account", () => {
    expect(
      codesOf({
        sdk: sdk(),
        details: details({ isCreditAccountFrozen: true }),
        liquidator: STRANGER,
      }),
    ).toEqual(["creditAccountFrozen"]);
  });

  it("refuses a paused market to anyone but its emergency liquidators", () => {
    expect(
      codesOf({
        sdk: sdk(),
        details: details({ paused: true }),
        liquidator: STRANGER,
      }),
    ).toEqual(["notEmergencyLiquidator"]);
  });

  it("lets an emergency liquidator through a paused market", () => {
    expect(
      codesOf({
        sdk: sdk([LIQUIDATOR]),
        details: details({ paused: true }),
        liquidator: LIQUIDATOR,
      }),
    ).toEqual([]);
  });

  /**
   * The regression this pins: comparing the checksummed registry entry against
   * a lowercased account with `===` denies every emergency liquidator on every
   * paused facade, with a perfectly plausible error message.
   */
  it("recognises an emergency liquidator across address casing", () => {
    expect(
      codesOf({
        sdk: sdk([LIQUIDATOR]),
        details: details({ paused: true }),
        liquidator: LIQUIDATOR_LOWER,
      }),
    ).toEqual([]);
    expect(
      codesOf({
        sdk: sdk([LIQUIDATOR_LOWER]),
        details: details({ paused: true }),
        liquidator: LIQUIDATOR,
      }),
    ).toEqual([]);
  });

  it("refuses a wallet the assets' KYC does not clear, and names it", () => {
    const [error] = checkLiquidationEligibility({
      sdk: sdk(),
      details: details({
        isLiquidatorEligible: false,
        kycProtocol: "securitize",
        kycToken: TOK,
      }),
      liquidator: STRANGER,
    });

    expect(error).toMatchObject({
      code: "liquidatorNotEligible",
      kycProtocol: "securitize",
      kycToken: TOK,
    });
  });

  /**
   * Order is the answer: a caller with room for one verdict reports the first,
   * and a frozen account is the fact furthest from anything the wallet can fix.
   */
  it("weighs frozen before paused before KYC", () => {
    expect(
      codesOf({
        sdk: sdk(),
        details: details({
          isCreditAccountFrozen: true,
          paused: true,
          isLiquidatorEligible: false,
        }),
        liquidator: STRANGER,
      }),
    ).toEqual([
      "creditAccountFrozen",
      "notEmergencyLiquidator",
      "liquidatorNotEligible",
    ]);
  });
});
