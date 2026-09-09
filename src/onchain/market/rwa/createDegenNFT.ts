import type { Address } from "viem";
import { decodeAbiParameters, isAddressEqual } from "viem";
import { iVersionAbi } from "../../../abi/iVersion.js";
import { iMidasDegenNFTAbi } from "../../../abi/rwa/iMidasDegenNFT.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { bytes32ToString } from "../../utils/index.js";
import { DEGEN_NFT_MIDAS } from "./midas/constants.js";
import { MidasDegenNFT } from "./midas/MidasDegenNFT.js";
import { DEGEN_NFT_SECURITIZE } from "./securitize/constants.js";
import type { IDegenNFT } from "./types.js";

/**
 * Determines the KYC provider behind a degen NFT.
 * Returns `undefined` for an allowlist, a legacy degen NFT, or a Securitize
 * factory that is not loaded on this SDK.
 */
export async function createDegenNFT(
  sdk: OnchainSDK,
  address: Address,
): Promise<IDegenNFT | undefined> {
  const [contractType, version, serialized] = await sdk.client.multicall({
    allowFailure: true,
    contracts: [
      { abi: iVersionAbi, address, functionName: "contractType" },
      { abi: iVersionAbi, address, functionName: "version" },
      { abi: iMidasDegenNFTAbi, address, functionName: "serialize" },
    ],
  });
  if (
    contractType.status !== "success" ||
    version.status !== "success" ||
    serialized.status !== "success"
  ) {
    return undefined;
  }
  switch (bytes32ToString(contractType.result)) {
    case DEGEN_NFT_MIDAS:
      return new MidasDegenNFT(sdk, {
        addr: address,
        version: version.result,
        contractType: contractType.result,
        serializedParams: serialized.result,
      });
    case DEGEN_NFT_SECURITIZE: {
      const [factoryAddress] = decodeAbiParameters(
        [{ type: "address" }],
        serialized.result,
      );
      const factory = sdk.rwa.factories.find(f =>
        isAddressEqual(f.address, factoryAddress),
      );
      return factory?.degenNFT;
    }
    default:
      return undefined;
  }
}
