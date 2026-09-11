import type { Address, Hex } from "viem";
import { decodeAbiParameters } from "viem";
import { iMidasAccessControlAbi } from "../../../../abi/rwa/iMidasAccessControl.js";
import { iMidasDegenNFTAbi } from "../../../../abi/rwa/iMidasDegenNFT.js";
import {
  KYC_REGISTRATION_LINKS,
  type MidasOpenAccountRequirements,
} from "../../../../model/index.js";
import { BaseContract, type RelaxedBaseParams } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { iMidasGatewayV311Abi } from "../../adapters/abi/index.js";
import type { GetOpenAccountRequirementsProps, IDegenNFT } from "../types.js";
import { DEGEN_NFT_MIDAS } from "./constants.js";

const abi = iMidasDegenNFTAbi;
type abi = typeof abi;

/**
 * Midas is an RWA protocol without a factory: accounts open through the plain
 * facade. Only a Permissioned-mode gateway deploys a degen NFT, so a Midas
 * strategy that does not require KYC has no NFT at all.
 */
export class MidasDegenNFT
  extends BaseContract<abi>
  implements IDegenNFT<"midas">
{
  public readonly protocol = "midas" as const;
  public readonly registrationLink = KYC_REGISTRATION_LINKS.midas;
  public readonly gateway: Address;
  public readonly accessControl: Address;
  public readonly greenlistedRole: Hex;
  #mToken?: Address;

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

  public async getTokens(): Promise<Address[]> {
    return [await this.#mTokenAddress()];
  }

  /**
   * Same predicate `MidasDegenNFT.burn` reverts on; the mToken rides along in
   * the batch until it is cached.
   */
  public async getOpenAccountRequirements(
    wallet: Address,
    _props: GetOpenAccountRequirementsProps,
  ): Promise<MidasOpenAccountRequirements> {
    const token = this.#mToken;
    if (token !== undefined) {
      const greenlisted = await this.client.readContract({
        abi: iMidasAccessControlAbi,
        address: this.accessControl,
        functionName: "hasRole",
        args: [this.greenlistedRole, wallet],
      });
      return { protocol: "midas", token, greenlisted };
    }
    const [greenlisted, mToken] = await this.client.multicall({
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
    this.#mToken = mToken;
    return { protocol: "midas", token: mToken, greenlisted };
  }

  public isRegistered(requirements: MidasOpenAccountRequirements): boolean {
    return requirements.greenlisted;
  }

  public getMissingRequirements(): undefined {
    return undefined;
  }

  async #mTokenAddress(): Promise<Address> {
    if (this.#mToken === undefined) {
      this.#mToken = await this.client.readContract({
        abi: iMidasGatewayV311Abi,
        address: this.gateway,
        functionName: "mToken",
      });
    }
    return this.#mToken;
  }
}
