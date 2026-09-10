import type { Address, Hex } from "viem";
import { decodeAbiParameters } from "viem";
import { iMidasAccessControlAbi } from "../../../../abi/rwa/iMidasAccessControl.js";
import { iMidasDegenNFTAbi } from "../../../../abi/rwa/iMidasDegenNFT.js";
import { BaseContract, type RelaxedBaseParams } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { iMidasGatewayV311Abi } from "../../adapters/abi/index.js";
import type { IDegenNFT, KycCheckResult } from "../types.js";
import { DEGEN_NFT_MIDAS } from "./constants.js";

const abi = iMidasDegenNFTAbi;
type abi = typeof abi;

export class MidasDegenNFT extends BaseContract<abi> implements IDegenNFT {
  public readonly protocol = "midas" as const;
  public readonly gateway: Address;
  public readonly accessControl: Address;
  public readonly greenlistedRole: Hex;

  constructor(sdk: OnchainSDK, baseParams: RelaxedBaseParams) {
    super(sdk, {
      ...baseParams,
      contractType: baseParams.contractType || DEGEN_NFT_MIDAS,
      name: "MidasDegenNFT",
      abi,
    });
    if (!baseParams.serializedParams) {
      throw new Error(
        `MidasDegenNFT at ${baseParams.addr} is missing serializedParams`,
      );
    }
    const [gateway, accessControl, greenlistedRole] = decodeAbiParameters(
      [{ type: "address" }, { type: "address" }, { type: "bytes32" }],
      baseParams.serializedParams,
    );
    this.gateway = gateway;
    this.accessControl = accessControl;
    this.greenlistedRole = greenlistedRole;
  }

  /** Same predicate `MidasDegenNFT.burn` reverts on; the mToken rides along in the batch. */
  public async checkKyc(
    wallet: Address,
    _targetCollateral: Address,
  ): Promise<KycCheckResult> {
    const [eligible, token] = await this.client.multicall({
      allowFailure: false,
      contracts: [
        {
          abi: iMidasAccessControlAbi,
          address: this.accessControl,
          functionName: "hasRole",
          args: [this.greenlistedRole, wallet],
        },
        {
          abi: iMidasGatewayV311Abi,
          address: this.gateway,
          functionName: "mToken",
        },
      ],
    });
    return { eligible, token };
  }
}
