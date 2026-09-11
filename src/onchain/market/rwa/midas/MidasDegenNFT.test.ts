import type { Address, Hex } from "viem";
import { encodeAbiParameters, getAddress } from "viem";
import { describe, expect, it, vi } from "vitest";
import { iMidasAccessControlAbi } from "../../../../abi/rwa/iMidasAccessControl.js";
import { KYC_REGISTRATION_LINKS } from "../../../../model/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { iMidasGatewayV311Abi } from "../../adapters/abi/index.js";
import { DEGEN_NFT_MIDAS } from "../index.js";
import { MidasDegenNFT } from "./MidasDegenNFT.js";

const DEGEN = "0x1111111111111111111111111111111111111111" as Address;
const GATEWAY = "0x2222222222222222222222222222222222222222" as Address;
const ACCESS = "0x3333333333333333333333333333333333333333" as Address;
const WALLET = "0x4444444444444444444444444444444444444444" as Address;
const TARGET = "0x5555555555555555555555555555555555555555" as Address;
const ROLE =
  "0x1111111111111111111111111111111111111111111111111111111111111111" as Hex;

function serializeMidas(
  gateway: Address,
  accessControl: Address,
  role: Hex,
): Hex {
  return encodeAbiParameters(
    [{ type: "address" }, { type: "address" }, { type: "bytes32" }],
    [gateway, accessControl, role],
  );
}

interface ClientMock {
  multicall: ReturnType<typeof vi.fn>;
  readContract: ReturnType<typeof vi.fn>;
}

function sdkMock(over: { greenlisted?: boolean; mToken?: Address }): {
  sdk: OnchainSDK;
  client: ClientMock;
} {
  const client: ClientMock = {
    multicall: vi.fn(async () => [
      over.greenlisted ?? true,
      over.mToken ?? TARGET,
    ]),
    readContract: vi.fn(async ({ functionName }: { functionName: string }) => {
      if (functionName === "mToken") {
        return over.mToken ?? TARGET;
      }
      if (functionName === "hasRole") {
        return over.greenlisted ?? true;
      }
      throw new Error(`unexpected ${functionName}`);
    }),
  };
  return { sdk: { client } as unknown as OnchainSDK, client };
}

function nftOf(sdk: OnchainSDK): MidasDegenNFT {
  return new MidasDegenNFT(sdk, {
    addr: DEGEN,
    version: 311,
    contractType: DEGEN_NFT_MIDAS,
    serializedParams: serializeMidas(GATEWAY, ACCESS, ROLE),
  });
}

describe("MidasDegenNFT.getOpenAccountRequirements", () => {
  it.each([
    { name: "greenlisted", greenlisted: true },
    { name: "not greenlisted", greenlisted: false },
  ])("$name", async ({ greenlisted }) => {
    const { sdk, client } = sdkMock({ greenlisted });
    await expect(
      nftOf(sdk).getOpenAccountRequirements(WALLET, {
        tokenOutAddress: TARGET,
      }),
    ).resolves.toEqual({
      protocol: "midas",
      token: TARGET,
      greenlisted,
    });
    expect(client.multicall).toHaveBeenCalledWith({
      allowFailure: false,
      contracts: [
        {
          abi: iMidasAccessControlAbi,
          address: getAddress(ACCESS),
          functionName: "hasRole",
          args: [ROLE, WALLET],
        },
        {
          abi: iMidasGatewayV311Abi,
          address: getAddress(GATEWAY),
          functionName: "mToken",
        },
      ],
    });
  });
});

describe("MidasDegenNFT.isRegistered", () => {
  it.each([
    { greenlisted: true, expected: true },
    { greenlisted: false, expected: false },
  ])("$greenlisted → $expected", ({ greenlisted, expected }) => {
    const { sdk } = sdkMock({});
    expect(
      nftOf(sdk).isRegistered({
        protocol: "midas",
        token: TARGET,
        greenlisted,
      }),
    ).toBe(expected);
  });
});

describe("MidasDegenNFT.getTokens", () => {
  it("reads mToken once and caches", async () => {
    const { sdk, client } = sdkMock({ mToken: TARGET });
    const nft = nftOf(sdk);
    await expect(nft.getTokens()).resolves.toEqual([getAddress(TARGET)]);
    await expect(nft.getTokens()).resolves.toEqual([getAddress(TARGET)]);
    expect(client.readContract).toHaveBeenCalledTimes(1);
    expect(client.readContract).toHaveBeenCalledWith({
      abi: iMidasGatewayV311Abi,
      address: getAddress(GATEWAY),
      functionName: "mToken",
    });
  });
});

describe("MidasDegenNFT.getMissingRequirements", () => {
  it("is always undefined", () => {
    const { sdk } = sdkMock({});
    const nft = nftOf(sdk);
    expect(nft.getMissingRequirements()).toBeUndefined();
    expect(nft.registrationLink).toBe(KYC_REGISTRATION_LINKS.midas);
  });
});
