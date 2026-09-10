import type { Address, Hex } from "viem";
import { encodeAbiParameters, getAddress } from "viem";
import { describe, expect, it, vi } from "vitest";
import { iMidasAccessControlAbi } from "../../../../abi/rwa/iMidasAccessControl.js";
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

function sdkMock(midas: [boolean, Address]): OnchainSDK {
  const multicall = vi.fn(async () => midas);
  return {
    client: { multicall },
  } as unknown as OnchainSDK;
}

function nftOf(sdk: OnchainSDK): MidasDegenNFT {
  return new MidasDegenNFT(sdk, {
    addr: DEGEN,
    version: 311,
    contractType: DEGEN_NFT_MIDAS,
    serializedParams: serializeMidas(GATEWAY, ACCESS, ROLE),
  });
}

describe("MidasDegenNFT.checkKyc", () => {
  it.each([
    { name: "greenlisted", eligible: true },
    { name: "not greenlisted", eligible: false },
  ])("$name", async ({ eligible }) => {
    const sdk = sdkMock([eligible, TARGET]);
    await expect(nftOf(sdk).checkKyc(WALLET, TARGET)).resolves.toEqual({
      eligible,
      token: TARGET,
    });
    expect(sdk.client.multicall).toHaveBeenCalledWith({
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
