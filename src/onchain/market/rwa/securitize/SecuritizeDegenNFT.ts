import type { Address } from "viem";
import { iSecuritizeDegenNFTAbi } from "../../../../abi/rwa/iSecuritizeDegenNFT.js";
import { BaseContract } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";

const abi = iSecuritizeDegenNFTAbi;
type abi = typeof abi;

export class SecuritizeDegenNFT extends BaseContract<abi> {
  constructor(sdk: OnchainSDK, address: Address) {
    super(sdk, {
      addr: address,
      contractType: "DEGEN_NFT::SECURITIZE",
      version: 310,
      name: "SecuritizeDegenNFT",
      abi,
    });
  }
}
