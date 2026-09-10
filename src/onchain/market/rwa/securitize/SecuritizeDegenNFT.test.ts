import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import {
  RWA_FACTORY_SECURITIZE,
  SECURITIZE_REGISTER_VAULT_TYPES,
  type SecuritizeOpenAccountRequirements,
} from "../../../../model/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { SecuritizeRWAFactory } from "./index.js";
import { SecuritizeDegenNFT } from "./SecuritizeDegenNFT.js";

const DEGEN = "0x1111111111111111111111111111111111111111" as Address;
const WALLET = "0x4444444444444444444444444444444444444444" as Address;
const TARGET = "0x5555555555555555555555555555555555555555" as Address;
const OTHER = "0x6666666666666666666666666666666666666666" as Address;
const FACTORY = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;

function factoryMock(over: {
  tokens?: Address[];
  requirements?: Awaited<
    ReturnType<SecuritizeRWAFactory["getOpenAccountRequirements"]>
  >;
  throwOnRead?: Error;
}): SecuritizeRWAFactory {
  return {
    address: FACTORY,
    getTokens: vi.fn(() => over.tokens ?? [TARGET]),
    getOpenAccountRequirements: over.throwOnRead
      ? vi.fn(async () => {
          throw over.throwOnRead;
        })
      : vi.fn(async () => over.requirements),
  } as unknown as SecuritizeRWAFactory;
}

function nftOf(factory: SecuritizeRWAFactory): SecuritizeDegenNFT {
  return new SecuritizeDegenNFT(
    { client: {} } as unknown as OnchainSDK,
    DEGEN,
    factory,
  );
}

describe("SecuritizeDegenNFT.checkKyc", () => {
  const message = {
    types: SECURITIZE_REGISTER_VAULT_TYPES,
    primaryType: "RegisterVault" as const,
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

  const pendingSignatures: SecuritizeOpenAccountRequirements = {
    type: RWA_FACTORY_SECURITIZE,
    securitizeTokensToRegister: [],
    tokensToRegister: [TARGET],
    requiredSignatures: [message],
  };

  const mustRegister: SecuritizeOpenAccountRequirements = {
    type: RWA_FACTORY_SECURITIZE,
    securitizeTokensToRegister: [TARGET],
    tokensToRegister: [TARGET],
    requiredSignatures: [],
  };

  it.each([
    {
      name: "strategy token is not DS-gated",
      tokens: [OTHER],
      requirements: undefined,
      expectRead: false,
      expected: { eligible: true, token: TARGET },
    },
    {
      name: "already registered",
      tokens: [TARGET],
      requirements: undefined,
      expectRead: true,
      expected: { eligible: true, token: TARGET },
    },
    {
      name: "pending signatures are not KYC",
      tokens: [TARGET],
      requirements: pendingSignatures,
      expectRead: true,
      expected: { eligible: true, token: TARGET },
    },
    {
      name: "must register on Securitize",
      tokens: [TARGET],
      requirements: mustRegister,
      expectRead: true,
      expected: { eligible: false, token: TARGET },
    },
  ])("$name", async ({ tokens, requirements, expectRead, expected }) => {
    const factory = factoryMock({ tokens, requirements });
    await expect(nftOf(factory).checkKyc(WALLET, TARGET)).resolves.toEqual(
      expected,
    );
    if (expectRead) {
      expect(factory.getOpenAccountRequirements).toHaveBeenCalledWith(WALLET, {
        tokenOutAddress: TARGET,
      });
    } else {
      expect(factory.getOpenAccountRequirements).not.toHaveBeenCalled();
    }
  });

  it("does not swallow a rejected open-account requirements read", async () => {
    const factory = factoryMock({ throwOnRead: new Error("compressor down") });
    await expect(nftOf(factory).checkKyc(WALLET, TARGET)).rejects.toThrow(
      "compressor down",
    );
  });
});
