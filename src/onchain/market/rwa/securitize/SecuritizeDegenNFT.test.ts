import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import {
  KYC_REGISTRATION_LINKS,
  SECURITIZE_REGISTER_VAULT_TYPES,
  type SecuritizeOpenAccountRequirements,
  type SecuritizeRegisterVaultMessage,
} from "../../../../model/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { SecuritizeRWAFactory } from "./index.js";
import { SecuritizeDegenNFT } from "./SecuritizeDegenNFT.js";

const DEGEN = "0x1111111111111111111111111111111111111111" as Address;
const WALLET = "0x4444444444444444444444444444444444444444" as Address;
const TARGET = "0x5555555555555555555555555555555555555555" as Address;
const OTHER = "0x6666666666666666666666666666666666666666" as Address;
const FACTORY = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;

const MESSAGE: SecuritizeRegisterVaultMessage = {
  types: SECURITIZE_REGISTER_VAULT_TYPES,
  primaryType: "RegisterVault",
  domain: {
    name: "VaultRegistrar",
    version: "1",
    chainId: 1n,
    verifyingContract: FACTORY,
  },
  message: {
    investor: WALLET,
    operator: DEGEN,
    token: TARGET,
    nonce: 0n,
    deadline: 1n,
  },
};

function factoryMock(over: {
  tokens?: Address[];
  investorData?: {
    registeredTokens: Address[];
    cachedSignatures: { token: Address }[];
    registerVaultMessages: SecuritizeRegisterVaultMessage[];
  };
  throwOnRead?: Error;
}): SecuritizeRWAFactory {
  return {
    address: FACTORY,
    getTokens: vi.fn(() => over.tokens ?? [TARGET]),
  } as unknown as SecuritizeRWAFactory;
}

function nftOf(
  factory: SecuritizeRWAFactory,
  over: {
    investorData?: {
      registeredTokens: Address[];
      cachedSignatures: { token: Address }[];
      registerVaultMessages: SecuritizeRegisterVaultMessage[];
    };
    throwOnRead?: Error;
  } = {},
): { nft: SecuritizeDegenNFT; getInvestorData: ReturnType<typeof vi.fn> } {
  const getInvestorData = over.throwOnRead
    ? vi.fn(async () => {
        throw over.throwOnRead;
      })
    : vi.fn(async () => [
        {
          registeredTokens: over.investorData?.registeredTokens ?? [],
          cachedSignatures: over.investorData?.cachedSignatures ?? [],
          registerVaultMessages: over.investorData?.registerVaultMessages ?? [],
        },
      ]);
  return {
    nft: new SecuritizeDegenNFT(
      { rwa: { getInvestorData } } as unknown as OnchainSDK,
      DEGEN,
      factory,
    ),
    getInvestorData,
  };
}

describe("SecuritizeDegenNFT.getOpenAccountRequirements", () => {
  it.each([
    {
      name: "non-DS target → empty, no compressor read",
      tokens: [OTHER],
      tokenOut: TARGET,
      investorData: undefined,
      expected: {
        protocol: "securitize" as const,
        factory: FACTORY,
        securitizeTokensToRegister: [],
        tokensToRegister: [],
        requiredSignatures: [],
      },
      expectRead: false,
    },
    {
      name: "registered and signed",
      tokens: [TARGET],
      tokenOut: TARGET,
      investorData: {
        registeredTokens: [TARGET],
        cachedSignatures: [{ token: TARGET }],
        registerVaultMessages: [MESSAGE],
      },
      expected: {
        protocol: "securitize" as const,
        factory: FACTORY,
        securitizeTokensToRegister: [],
        tokensToRegister: [TARGET],
        requiredSignatures: [],
      },
      expectRead: true,
    },
    {
      name: "registered but unsigned → requiredSignatures",
      tokens: [TARGET],
      tokenOut: TARGET,
      investorData: {
        registeredTokens: [TARGET],
        cachedSignatures: [],
        registerVaultMessages: [MESSAGE],
      },
      expected: {
        protocol: "securitize" as const,
        factory: FACTORY,
        securitizeTokensToRegister: [],
        tokensToRegister: [TARGET],
        requiredSignatures: [MESSAGE],
      },
      expectRead: true,
    },
    {
      name: "unregistered → securitizeTokensToRegister",
      tokens: [TARGET],
      tokenOut: TARGET,
      investorData: {
        registeredTokens: [],
        cachedSignatures: [],
        registerVaultMessages: [MESSAGE],
      },
      expected: {
        protocol: "securitize" as const,
        factory: FACTORY,
        securitizeTokensToRegister: [TARGET],
        tokensToRegister: [TARGET],
        requiredSignatures: [MESSAGE],
      },
      expectRead: true,
    },
  ])(
    "$name",
    async ({ tokens, tokenOut, investorData, expected, expectRead }) => {
      const factory = factoryMock({ tokens });
      const { nft, getInvestorData } = nftOf(factory, { investorData });
      await expect(
        nft.getOpenAccountRequirements(WALLET, { tokenOutAddress: tokenOut }),
      ).resolves.toEqual(expected);
      if (expectRead) {
        expect(getInvestorData).toHaveBeenCalledWith(WALLET, [FACTORY]);
      } else {
        expect(getInvestorData).not.toHaveBeenCalled();
      }
    },
  );

  it("does not swallow a rejected investor-data read", async () => {
    const factory = factoryMock({ tokens: [TARGET] });
    const { nft } = nftOf(factory, {
      throwOnRead: new Error("compressor down"),
    });
    await expect(
      nft.getOpenAccountRequirements(WALLET, { tokenOutAddress: TARGET }),
    ).rejects.toThrow("compressor down");
  });
});

describe("SecuritizeDegenNFT.isRegistered", () => {
  it.each([
    { pending: [] as Address[], expected: true },
    { pending: [TARGET], expected: false },
  ])("$pending → $expected", ({ pending, expected }) => {
    const { nft } = nftOf(factoryMock({}));
    const requirements: SecuritizeOpenAccountRequirements = {
      protocol: "securitize",
      factory: FACTORY,
      securitizeTokensToRegister: pending,
      tokensToRegister: [TARGET],
      requiredSignatures: [],
    };
    expect(nft.isRegistered(requirements)).toBe(expected);
  });
});

describe("SecuritizeDegenNFT.getMissingRequirements", () => {
  const requirements: SecuritizeOpenAccountRequirements = {
    protocol: "securitize",
    factory: FACTORY,
    securitizeTokensToRegister: [],
    tokensToRegister: [TARGET],
    requiredSignatures: [MESSAGE],
  };

  it.each([
    {
      name: "none missing when the signature is on the tx",
      provided: {
        protocol: "securitize" as const,
        tokensToRegister: [TARGET],
        signaturesToCache: [
          {
            token: TARGET,
            signature: { deadline: 1n, signature: "0xab" as const },
          },
        ],
      },
      expected: undefined,
    },
    {
      name: "still missing without a provided signature",
      provided: {
        protocol: "securitize" as const,
        tokensToRegister: [TARGET],
        signaturesToCache: [],
      },
      expected: {
        protocol: "securitize" as const,
        requiredSignatures: [MESSAGE],
      },
    },
    {
      name: "none missing when there is nothing to sign",
      provided: undefined,
      expected: undefined,
      emptyRequirements: true,
    },
  ])("$name", ({ provided, expected, emptyRequirements }) => {
    const { nft } = nftOf(factoryMock({}));
    const req = emptyRequirements
      ? { ...requirements, requiredSignatures: [] }
      : requirements;
    expect(nft.getMissingRequirements(req, provided)).toEqual(expected);
    expect(nft.registrationLink).toBe(KYC_REGISTRATION_LINKS.securitize);
  });
});
