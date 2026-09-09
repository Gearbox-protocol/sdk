import type { Address } from "viem";
import { isAddressEqual } from "viem";
import { iSecuritizeDegenNFTAbi } from "../../../../abi/rwa/iSecuritizeDegenNFT.js";
import { BaseContract } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { IDegenNFT, KycCheckResult } from "../types.js";
import { DEGEN_NFT_SECURITIZE } from "./constants.js";
import type { SecuritizeRWAFactory } from "./SecuritizeRWAFactory.js";

const abi = iSecuritizeDegenNFTAbi;
type abi = typeof abi;

export class SecuritizeDegenNFT extends BaseContract<abi> implements IDegenNFT {
  public readonly protocol = "securitize" as const;
  public readonly factory: SecuritizeRWAFactory;

  constructor(
    sdk: OnchainSDK,
    address: Address,
    factory: SecuritizeRWAFactory,
  ) {
    super(sdk, {
      addr: address,
      contractType: DEGEN_NFT_SECURITIZE,
      version: 310,
      name: "SecuritizeDegenNFT",
      abi,
    });
    this.factory = factory;
  }

  /** Registration on Securitize is the only KYC step; pending EIP-712 signatures are not. */
  public async checkKyc(
    wallet: Address,
    targetCollateral: Address,
  ): Promise<KycCheckResult> {
    const { factory } = this;
    if (!factory.getTokens().some(t => isAddressEqual(t, targetCollateral))) {
      return { eligible: true, token: targetCollateral };
    }
    const req = await factory.getOpenAccountRequirements(wallet, {
      tokenOutAddress: targetCollateral,
    });
    return {
      eligible: !req || req.securitizeTokensToRegister.length === 0,
      token: req?.securitizeTokensToRegister[0] ?? targetCollateral,
    };
  }
}
