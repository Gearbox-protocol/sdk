import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Address } from "viem";
import { custom } from "viem";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  type OpenRWAStrategyPositionPreview,
  RWA_FACTORY_SECURITIZE,
  type RWAOperationArgs,
  SECURITIZE_REGISTER_VAULT_TYPES,
  type SecuritizeRegisterVaultMessage,
  type TokenAmount,
} from "../../../model/index.js";
import { json_parse, OnchainSDK } from "../../index.js";
import type { IRWAFactory } from "../../market/rwa/types.js";
import { CM, OWNER, TOK } from "../testing/tokens.js";
import { checkRWAOpening } from "./checkRWAOpening.js";

const FIXTURE = resolve(
  import.meta.dirname,
  "../../../preview/__fixtures__/Mainnet-25432463-securitize.json",
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
  over: Partial<OpenRWAStrategyPositionPreview> = {},
): OpenRWAStrategyPositionPreview {
  return {
    operation: "RWAOpenCreditAccount",
    creditManager: CREDIT_MANAGER,
    collateralAdded: [amount(DS_TOKEN, 1n)],
    quotas: [amount(DS_TOKEN, 1n)],
    rwaArgs: {
      type: RWA_FACTORY_SECURITIZE,
      tokensToRegister: [],
      signaturesToCache: [],
    },
    ...over,
  } as OpenRWAStrategyPositionPreview;
}

describe("checkRWAOpening", () => {
  describe("routing", () => {
    it("returns nothing when the market has no RWA factory", async () => {
      const sdk = {
        marketRegister: {
          findByCreditManager: () => ({ rwaFactory: undefined }),
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

    it("asks only for factory-gated tokens from collateralAdded and quotas", async () => {
      const getOpenAccountRequirements = vi.fn(async () => undefined);
      const rwaFactory = {
        address: FACTORY,
        getTokens: () => [TOK.address],
        getMissingRequirements: vi.fn(),
      } as unknown as IRWAFactory;
      const sdk = {
        accounts: { getOpenAccountRequirements },
        marketRegister: {
          findByCreditManager: () => ({ rwaFactory }),
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
      expect(getOpenAccountRequirements).toHaveBeenCalledWith(OWNER, CM, {
        tokenOutAddress: TOK.address,
      });
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
        type: RWA_FACTORY_SECURITIZE,
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
            type: RWA_FACTORY_SECURITIZE,
            securitizeTokensToRegister: [],
            tokensToRegister: [DS_TOKEN],
            requiredSignatures: [{ message: { token: DS_TOKEN } }],
          },
          missing: {
            type: RWA_FACTORY_SECURITIZE,
            requiredSignatures: [{ message: { token: DS_TOKEN } }],
          },
        },
      ]);
    });
  });
});
