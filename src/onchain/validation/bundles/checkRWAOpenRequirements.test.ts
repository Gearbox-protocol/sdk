import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import {
  KYC_REGISTRATION_LINKS,
  SECURITIZE_REGISTER_VAULT_TYPES,
  type SecuritizeMissingOpenAccountRequirements,
  type SecuritizeOpenAccountRequirements,
  type SecuritizeOperationArgs,
  type SecuritizeRegisterVaultMessage,
} from "../../../model/index.js";
import type { IDegenNFT } from "../../market/rwa/types.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { CM, OWNER, TOK } from "../testing/tokens.js";
import { checkRWAOpenRequirements } from "./checkRWAOpenRequirements.js";

const FACTORY = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address;

function registerVaultMessage(token: Address): SecuritizeRegisterVaultMessage {
  return {
    types: SECURITIZE_REGISTER_VAULT_TYPES,
    primaryType: "RegisterVault",
    domain: {
      name: "VaultRegistrar",
      version: "1",
      chainId: 1n,
      verifyingContract: FACTORY,
    },
    message: {
      investor: OWNER,
      operator: FACTORY,
      token,
      nonce: 0n,
      deadline: 1n,
    },
  };
}

const MESSAGE = registerVaultMessage(TOK.address);

const SECURITIZE_REQUIREMENTS: SecuritizeOpenAccountRequirements = {
  protocol: "securitize",
  factory: FACTORY,
  securitizeTokensToRegister: [],
  tokensToRegister: [TOK.address],
  requiredSignatures: [MESSAGE],
};

function sdk(over: {
  nft?: IDegenNFT | undefined;
  throwOnNft?: Error;
}): OnchainSDK {
  const degenNFT = over.throwOnNft
    ? vi.fn(async () => {
        throw over.throwOnNft;
      })
    : vi.fn(async () => over.nft);
  return {
    chainId: 1,
    marketRegister: {
      findCreditManager: () => ({ degenNFT }),
    },
    tokensMeta: {
      getToken: (address: Address) =>
        address === TOK.address ? TOK : undefined,
    },
  } as unknown as OnchainSDK;
}

function nftMock(over: {
  protocol?: "securitize" | "midas";
  requirements?: Awaited<ReturnType<IDegenNFT["getOpenAccountRequirements"]>>;
  missing?: ReturnType<IDegenNFT["getMissingRequirements"]>;
  registered?: boolean;
}): IDegenNFT {
  const protocol = over.protocol ?? "securitize";
  return {
    protocol,
    registrationLink: KYC_REGISTRATION_LINKS[protocol],
    getOpenAccountRequirements: vi.fn(async () => over.requirements),
    getMissingRequirements: vi.fn(() => over.missing),
    isRegistered: vi.fn(() => over.registered ?? false),
  } as unknown as IDegenNFT;
}

async function check(
  over: Parameters<typeof sdk>[0],
  providedArgs?: SecuritizeOperationArgs,
) {
  return checkRWAOpenRequirements({
    sdk: sdk(over),
    wallet: OWNER,
    creditManager: CM,
    token: TOK.address,
    providedArgs,
  });
}

describe("checkRWAOpenRequirements", () => {
  it("returns nothing when there is no degen NFT", async () => {
    expect(await check({ nft: undefined })).toEqual([]);
  });

  it("returns nothing when Securitize requirements are met", async () => {
    expect(
      await check({
        nft: nftMock({
          requirements: SECURITIZE_REQUIREMENTS,
          missing: undefined,
          registered: true,
        }),
      }),
    ).toEqual([]);
  });

  it("carries protocol, registrationLink, requirements and missing when signatures are still needed", async () => {
    const missing: SecuritizeMissingOpenAccountRequirements = {
      protocol: "securitize",
      requiredSignatures: [MESSAGE],
    };
    expect(
      await check({
        nft: nftMock({
          requirements: SECURITIZE_REQUIREMENTS,
          missing,
          registered: true,
        }),
      }),
    ).toEqual([
      {
        code: "rwaOpenRequirementsNotMet",
        message: expect.any(String),
        token: TOK,
        creditManager: CM,
        protocol: "securitize",
        registrationLink: KYC_REGISTRATION_LINKS.securitize,
        requirements: SECURITIZE_REQUIREMENTS,
        missing,
      },
    ]);
  });

  it("reports the error with missing absent when only issuer-side registration is pending", async () => {
    const requirements: SecuritizeOpenAccountRequirements = {
      ...SECURITIZE_REQUIREMENTS,
      securitizeTokensToRegister: [TOK.address],
      requiredSignatures: [],
    };
    expect(
      await check({
        nft: nftMock({
          requirements,
          missing: undefined,
          registered: false,
        }),
      }),
    ).toEqual([
      {
        code: "rwaOpenRequirementsNotMet",
        message: expect.any(String),
        token: TOK,
        creditManager: CM,
        protocol: "securitize",
        registrationLink: KYC_REGISTRATION_LINKS.securitize,
        requirements,
      },
    ]);
  });

  it("returns nothing when Midas has greenlisted the wallet", async () => {
    expect(
      await check({
        nft: nftMock({
          protocol: "midas",
          requirements: {
            protocol: "midas",
            token: TOK.address,
            greenlisted: true,
          },
          missing: undefined,
          registered: true,
        }),
      }),
    ).toEqual([]);
  });

  it("reports Midas not greenlisted with no missing", async () => {
    const requirements = {
      protocol: "midas" as const,
      token: TOK.address,
      greenlisted: false,
    };
    expect(
      await check({
        nft: nftMock({
          protocol: "midas",
          requirements,
          missing: undefined,
          registered: false,
        }),
      }),
    ).toEqual([
      {
        code: "rwaOpenRequirementsNotMet",
        message: expect.any(String),
        token: TOK,
        creditManager: CM,
        protocol: "midas",
        registrationLink: KYC_REGISTRATION_LINKS.midas,
        requirements,
      },
    ]);
  });

  it("reports unexpectedFailure when the NFT read throws", async () => {
    const cause = new Error("compressor down");
    expect(await check({ throwOnNft: cause })).toEqual([
      {
        code: "unexpectedFailure",
        message:
          "The SDK could not read the RWA opening requirements: compressor down",
        cause,
      },
    ]);
  });
});
