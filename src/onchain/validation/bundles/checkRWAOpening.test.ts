import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Address } from "viem";
import { custom } from "viem";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  KYC_REGISTRATION_LINKS,
  type MidasOpenAccountRequirements,
  type OpenStrategyPositionPreview,
  RWA_FACTORY_SECURITIZE,
  type RWAOperationArgs,
  SECURITIZE_REGISTER_VAULT_TYPES,
  type SecuritizeRegisterVaultMessage,
  type TokenAmount,
} from "../../../model/index.js";
import { json_parse, OnchainSDK } from "../../index.js";
import type { IDegenNFT } from "../../market/rwa/types.js";
import { CA, CM, OWNER, TOK } from "../testing/tokens.js";
import { checkRWAOpening } from "./checkRWAOpening.js";

const FIXTURE = resolve(
  import.meta.dirname,
  "../../preview/__fixtures__/Mainnet-25432463-securitize.json",
);

const SENDER: Address = "0xf13df765f3047850Cede5aA9fDF20a12A75f7F70";
const FACTORY: Address = "0xc6f7B95f6fb8394541D9Ac8B0Abc94Bf6E84F703";
const CREDIT_MANAGER: Address = "0x025512D771f778fad99aB30b7A7363E7C8DE078D";
const DS_TOKEN: Address = "0x17418038ecF73BA4026c4f428547BF099706F27B";
const OPERATOR: Address = "0x04Ac894088fDd6fD622D9fe7c39192BafAeA15dB";
const OTHER = "0x1111111111111111111111111111111111111111" as Address;

const DUMMY_SIGNATURE = `0x${"ab".repeat(65)}` as const;

function registerVaultMessage(
  token: Address,
  deadline: bigint = 2n ** 256n - 1n,
): SecuritizeRegisterVaultMessage {
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
      investor: SENDER,
      operator: OPERATOR,
      token,
      nonce: 0n,
      deadline,
    },
  };
}

function amount(address: Address, value: bigint): TokenAmount {
  return {
    token: {
      chainId: 1,
      address,
      symbol: "T",
      name: "T",
      decimals: 18,
    },
    value,
    valueUsd: null,
  };
}

function preview(
  over: Partial<OpenStrategyPositionPreview> = {},
): OpenStrategyPositionPreview {
  return {
    operation: "OpenCreditAccount",
    creditManager: CREDIT_MANAGER,
    collateralAdded: [amount(DS_TOKEN, 1n)],
    quotas: [amount(DS_TOKEN, 1n)],
    rwaArgs: {
      protocol: "securitize",
      tokensToRegister: [],
      signaturesToCache: [],
    },
    ...over,
  } as OpenStrategyPositionPreview;
}

describe("checkRWAOpening", () => {
  describe("routing", () => {
    it("returns nothing when there is no degen NFT", async () => {
      const sdk = {
        marketRegister: {
          findCreditManager: () => ({
            degenNFT: async () => undefined,
          }),
        },
      } as unknown as OnchainSDK;

      expect(
        await checkRWAOpening({
          sdk,
          preview: preview({ creditManager: CM }),
          sender: OWNER,
        }),
      ).toEqual([]);
    });

    it("reads requirements only for degen-NFT tokens from collateralAdded and quotas", async () => {
      const getOpenAccountRequirements = vi.fn(async () => ({
        protocol: "securitize",
        factory: FACTORY,
        securitizeTokensToRegister: [],
        tokensToRegister: [TOK.address],
        requiredSignatures: [],
      }));
      const nft = {
        getTokens: async () => [TOK.address],
        getOpenAccountRequirements,
        getMissingRequirements: vi.fn(() => undefined),
        isRegistered: vi.fn(() => true),
        protocol: "securitize",
        registrationLink: KYC_REGISTRATION_LINKS.securitize,
      } as unknown as IDegenNFT;
      const sdk = {
        marketRegister: {
          findCreditManager: () => ({ degenNFT: async () => nft }),
        },
        tokensMeta: { getToken: () => TOK },
      } as unknown as OnchainSDK;

      await checkRWAOpening({
        sdk,
        preview: preview({
          creditManager: CM,
          collateralAdded: [amount(TOK.address, 1n), amount(OTHER, 1n)],
          quotas: [amount(OTHER, 2n)],
        }),
        sender: OWNER,
      });

      expect(getOpenAccountRequirements).toHaveBeenCalledTimes(1);
      expect(getOpenAccountRequirements).toHaveBeenCalledWith(OWNER, {
        tokenOutAddress: TOK.address,
      });
    });

    // Temporarily disabled: Midas has not granted the gateway permission
    // to greenlist addresses, so receiveGreenlist() does not grant the role.
    it.skip("checks a facade OpenCreditAccount with providedArgs undefined", async () => {
      const getMissingRequirements = vi.fn(() => undefined);
      const nft = {
        getTokens: async () => [TOK.address],
        getOpenAccountRequirements: vi.fn(async () => ({
          protocol: "midas",
          token: TOK.address,
          greenlisted: true,
        })),
        getMissingRequirements,
        isRegistered: vi.fn(() => true),
        protocol: "midas",
        registrationLink: KYC_REGISTRATION_LINKS.midas,
      } as unknown as IDegenNFT;
      const sdk = {
        marketRegister: {
          findCreditManager: () => ({ degenNFT: async () => nft }),
        },
        tokensMeta: { getToken: () => TOK },
      } as unknown as OnchainSDK;

      const facadePreview: OpenStrategyPositionPreview = {
        operation: "OpenCreditAccount",
        creditManager: CM,
        collateralAdded: [amount(TOK.address, 1n)],
        quotas: [amount(TOK.address, 1n)],
        midasGreenlistsAccount: true,
      } as OpenStrategyPositionPreview;

      expect(
        await checkRWAOpening({
          sdk,
          preview: facadePreview,
          sender: OWNER,
        }),
      ).toEqual([]);
      expect(getMissingRequirements).toHaveBeenCalledWith(
        expect.objectContaining({ protocol: "midas" }),
        undefined,
      );
    });
  });

  describe("Midas", () => {
    interface MidasNftOver {
      greenlisted?: boolean;
      getOpenAccountRequirements?: IDegenNFT["getOpenAccountRequirements"];
    }

    function midasNft(over: MidasNftOver = {}): IDegenNFT {
      const greenlisted = over.greenlisted ?? false;
      return {
        getTokens: vi.fn(async () => [TOK.address]),
        getOpenAccountRequirements:
          over.getOpenAccountRequirements ??
          vi.fn(async () => ({
            protocol: "midas",
            token: TOK.address,
            greenlisted,
          })),
        getMissingRequirements: vi.fn(() => undefined),
        isRegistered: vi.fn(
          (requirements: MidasOpenAccountRequirements) =>
            requirements.greenlisted === true,
        ),
        protocol: "midas",
        registrationLink: KYC_REGISTRATION_LINKS.midas,
      } as unknown as IDegenNFT;
    }

    function midasSdk(nft: IDegenNFT): OnchainSDK {
      return {
        marketRegister: {
          findCreditManager: () => ({ degenNFT: async () => nft }),
        },
        tokensMeta: { getToken: () => TOK },
      } as unknown as OnchainSDK;
    }

    it("reports the wallet requirement on a Midas empty opening", async () => {
      const nft = midasNft();
      const errors = await checkRWAOpening({
        sdk: midasSdk(nft),
        preview: preview({
          creditManager: CM,
          collateralAdded: [],
          quotas: [],
          rwaArgs: undefined,
        }),
        sender: OWNER,
      });
      expect(errors).toMatchObject([
        {
          code: "rwaOpenRequirementsNotMet",
          protocol: "midas",
          token: TOK,
        },
      ]);
      expect(nft.getOpenAccountRequirements).toHaveBeenCalledWith(OWNER, {
        tokenOutAddress: TOK.address,
      });
    });

    it("does not read requirements on a Securitize empty opening", async () => {
      const getOpenAccountRequirements = vi.fn();
      const nft = {
        getTokens: async () => [TOK.address],
        getOpenAccountRequirements,
        getMissingRequirements: vi.fn(() => undefined),
        isRegistered: vi.fn(() => true),
        protocol: "securitize",
        registrationLink: KYC_REGISTRATION_LINKS.securitize,
      } as unknown as IDegenNFT;
      const sdk = {
        marketRegister: {
          findCreditManager: () => ({ degenNFT: async () => nft }),
        },
        tokensMeta: { getToken: () => TOK },
      } as unknown as OnchainSDK;

      expect(
        await checkRWAOpening({
          sdk,
          preview: preview({
            creditManager: CM,
            collateralAdded: [],
            quotas: [],
          }),
          sender: OWNER,
        }),
      ).toEqual([]);
      expect(getOpenAccountRequirements).not.toHaveBeenCalled();
    });

    it("does not read requirements on a Midas empty reopen", async () => {
      const nft = midasNft();
      expect(
        await checkRWAOpening({
          sdk: midasSdk(nft),
          preview: preview({
            creditManager: CM,
            creditAccount: CA,
            collateralAdded: [],
            quotas: [],
            rwaArgs: undefined,
          }),
          sender: OWNER,
        }),
      ).toEqual([]);
      expect(nft.getOpenAccountRequirements).not.toHaveBeenCalled();
    });

    it("reports when a Midas reopen's account lacks the role", async () => {
      const getOpenAccountRequirements = vi.fn(async (wallet: Address) => ({
        protocol: "midas" as const,
        token: TOK.address,
        greenlisted: wallet === OWNER,
      }));
      const nft = midasNft({ getOpenAccountRequirements });
      const errors = await checkRWAOpening({
        sdk: midasSdk(nft),
        preview: preview({
          creditManager: CM,
          creditAccount: CA,
          collateralAdded: [amount(TOK.address, 1n)],
          quotas: [amount(TOK.address, 1n)],
          rwaArgs: undefined,
        }),
        sender: OWNER,
      });
      expect(errors).toMatchObject([
        {
          code: "accountNotMidasGreenlisted",
          token: TOK,
          creditManager: CM,
          creditAccount: CA,
        },
      ]);
      expect(getOpenAccountRequirements).toHaveBeenCalledWith(CA, {
        tokenOutAddress: TOK.address,
      });
      expect(nft.getTokens).toHaveBeenCalledTimes(1);
    });

    // Temporarily disabled: Midas has not granted the gateway permission
    // to greenlist addresses, so receiveGreenlist() does not grant the role.
    it.skip("returns nothing when a Midas reopen grants the role in the transaction", async () => {
      const nft = midasNft({ greenlisted: true });
      expect(
        await checkRWAOpening({
          sdk: midasSdk(nft),
          preview: preview({
            creditManager: CM,
            creditAccount: CA,
            collateralAdded: [amount(TOK.address, 1n)],
            quotas: [amount(TOK.address, 1n)],
            rwaArgs: undefined,
            midasGreenlistsAccount: true,
          }),
          sender: OWNER,
        }),
      ).toEqual([]);
      expect(nft.getOpenAccountRequirements).toHaveBeenCalledTimes(1);
      expect(nft.getOpenAccountRequirements).toHaveBeenCalledWith(OWNER, {
        tokenOutAddress: TOK.address,
      });
    });

    it("reports a fresh funded Midas opening without the greenlist call, with no extra RPC", async () => {
      const nft = midasNft({ greenlisted: true });
      const errors = await checkRWAOpening({
        sdk: midasSdk(nft),
        preview: preview({
          creditManager: CM,
          collateralAdded: [amount(TOK.address, 1n)],
          quotas: [amount(TOK.address, 1n)],
          rwaArgs: undefined,
        }),
        sender: OWNER,
      });
      expect(errors).toMatchObject([
        {
          code: "accountNotMidasGreenlisted",
          token: TOK,
          creditManager: CM,
        },
      ]);
      expect(errors[0]).not.toHaveProperty("creditAccount");
      expect(nft.getOpenAccountRequirements).toHaveBeenCalledTimes(1);
      expect(nft.getOpenAccountRequirements).toHaveBeenCalledWith(OWNER, {
        tokenOutAddress: TOK.address,
      });
      expect(nft.getTokens).toHaveBeenCalledTimes(1);
    });
  });

  describe("Securitize fixture", () => {
    let sdk: OnchainSDK;

    beforeAll(() => {
      sdk = new OnchainSDK("Mainnet", {
        transport: custom({
          request: async () => {
            throw new Error("offline: RWA opening test must not hit RPC");
          },
        }),
      });
      sdk.hydrate(json_parse(readFileSync(FIXTURE, "utf-8")));
      vi.spyOn(sdk.rwa, "getInvestorData").mockResolvedValue([
        {
          type: RWA_FACTORY_SECURITIZE,
          factory: FACTORY,
          creditAccounts: [],
          registeredTokens: [DS_TOKEN],
          cachedSignatures: [],
          registerVaultMessages: [registerVaultMessage(DS_TOKEN)],
        },
      ]);
    });

    it("is satisfied when the required signature is already in rwaArgs", async () => {
      const rwaArgs: RWAOperationArgs = {
        protocol: "securitize",
        tokensToRegister: [DS_TOKEN],
        signaturesToCache: [
          {
            token: DS_TOKEN,
            signature: {
              deadline: 2n ** 256n - 1n,
              signature: DUMMY_SIGNATURE,
            },
          },
        ],
      };
      expect(
        await checkRWAOpening({
          sdk,
          preview: preview({ rwaArgs }),
          sender: SENDER,
        }),
      ).toEqual([]);
    });

    it("lists the DSToken's message when rwaArgs are the template", async () => {
      const errors = await checkRWAOpening({
        sdk,
        preview: preview(),
        sender: SENDER,
      });
      expect(errors).toMatchObject([
        {
          code: "rwaOpenRequirementsNotMet",
          requirements: {
            protocol: "securitize",
            factory: FACTORY,
            securitizeTokensToRegister: [],
            tokensToRegister: [DS_TOKEN],
            requiredSignatures: [{ message: { token: DS_TOKEN } }],
          },
          missing: {
            protocol: "securitize",
            requiredSignatures: [{ message: { token: DS_TOKEN } }],
          },
        },
      ]);
    });
  });
});
