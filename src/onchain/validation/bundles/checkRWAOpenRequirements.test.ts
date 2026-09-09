import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import {
  RWA_FACTORY_SECURITIZE,
  type RWAMissingOpenAccountRequirements,
  type RWAOpenAccountRequirements,
  type RWAOperationArgs,
  SECURITIZE_REGISTER_VAULT_TYPES,
  type SecuritizeRegisterVaultMessage,
} from "../../../model/index.js";
import type { IRWAFactory } from "../../market/rwa/types.js";
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

const REQUIREMENTS: RWAOpenAccountRequirements = {
  type: RWA_FACTORY_SECURITIZE,
  securitizeTokensToRegister: [],
  tokensToRegister: [TOK.address],
  requiredSignatures: [MESSAGE],
};

const EMPTY_ARGS: RWAOperationArgs = {
  type: RWA_FACTORY_SECURITIZE,
  tokensToRegister: [],
  signaturesToCache: [],
};

function sdk(over: {
  requirements?: RWAOpenAccountRequirements | undefined;
  missing?: ReturnType<IRWAFactory["getMissingRequirements"]>;
  rwaFactory?: IRWAFactory | undefined;
  throwOnRead?: Error;
}): OnchainSDK {
  const rwaFactory =
    over.rwaFactory === undefined && !("rwaFactory" in over)
      ? ({
          address: FACTORY,
          getMissingRequirements: vi.fn(() => over.missing),
        } as unknown as IRWAFactory)
      : over.rwaFactory;

  return {
    chainId: 1,
    accounts: {
      getOpenAccountRequirements: over.throwOnRead
        ? vi.fn(async () => {
            throw over.throwOnRead;
          })
        : vi.fn(async () => over.requirements),
    },
    marketRegister: {
      findByCreditManager: () => ({ rwaFactory }),
    },
    tokensMeta: {
      getToken: (address: Address) =>
        address === TOK.address ? TOK : undefined,
    },
  } as unknown as OnchainSDK;
}

async function check(
  over: Parameters<typeof sdk>[0],
  providedArgs: RWAOperationArgs = EMPTY_ARGS,
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
  it("returns nothing when the factory does not gate the token", async () => {
    expect(await check({ requirements: undefined })).toEqual([]);
  });

  it("returns nothing when everything is met", async () => {
    expect(
      await check({ requirements: REQUIREMENTS, missing: undefined }),
    ).toEqual([]);
  });

  it("carries token, requirements and missing when signatures are still needed", async () => {
    const missing: RWAMissingOpenAccountRequirements = {
      type: RWA_FACTORY_SECURITIZE,
      requiredSignatures: [MESSAGE],
    };
    expect(await check({ requirements: REQUIREMENTS, missing })).toEqual([
      {
        code: "rwaOpenRequirementsNotMet",
        message: expect.any(String),
        token: TOK,
        creditManager: CM,
        factory: FACTORY,
        requirements: REQUIREMENTS,
        missing,
      },
    ]);
  });

  it("passes providedArgs through so a cached signature can clear the requirement", async () => {
    const getMissingRequirements = vi.fn(() => undefined);
    const rwaFactory = {
      address: FACTORY,
      getMissingRequirements,
    } as unknown as IRWAFactory;
    const providedArgs: RWAOperationArgs = {
      type: RWA_FACTORY_SECURITIZE,
      tokensToRegister: [TOK.address],
      signaturesToCache: [
        { token: TOK.address, signature: { deadline: 1n, signature: "0xab" } },
      ],
    };
    expect(
      await check({ requirements: REQUIREMENTS, rwaFactory }, providedArgs),
    ).toEqual([]);
    expect(getMissingRequirements).toHaveBeenCalledWith(
      REQUIREMENTS,
      providedArgs,
    );
  });

  it("reports the error with missing absent when only issuer-side registration is pending", async () => {
    const requirements: RWAOpenAccountRequirements = {
      ...REQUIREMENTS,
      securitizeTokensToRegister: [TOK.address],
      requiredSignatures: [],
    };
    expect(await check({ requirements, missing: undefined })).toEqual([
      {
        code: "rwaOpenRequirementsNotMet",
        message: expect.any(String),
        token: TOK,
        creditManager: CM,
        factory: FACTORY,
        requirements,
      },
    ]);
  });

  it("reports unexpectedFailure when the compressor read throws", async () => {
    const cause = new Error("compressor down");
    expect(await check({ throwOnRead: cause })).toEqual([
      {
        code: "unexpectedFailure",
        message:
          "The SDK could not read the RWA opening requirements: compressor down",
        cause,
      },
    ]);
  });

  it("reports unexpectedFailure when the market has no RWA factory", async () => {
    const [error] = await check({
      requirements: REQUIREMENTS,
      rwaFactory: undefined,
    });
    expect(error).toMatchObject({
      code: "unexpectedFailure",
      message: expect.stringContaining("no RWA factory"),
    });
  });
});
