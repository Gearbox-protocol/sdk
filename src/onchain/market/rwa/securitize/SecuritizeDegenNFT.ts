import type { Address } from "viem";
import { iSecuritizeDegenNFTAbi } from "../../../../abi/rwa/iSecuritizeDegenNFT.js";
import {
  KYC_REGISTRATION_LINKS,
  type SecuritizeMissingOpenAccountRequirements,
  type SecuritizeOpenAccountRequirements,
  type SecuritizeOperationArgs,
} from "../../../../model/index.js";
import { BaseContract } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { AddressSet } from "../../../utils/index.js";
import type { GetOpenAccountRequirementsProps, IDegenNFT } from "../types.js";
import { DEGEN_NFT_SECURITIZE } from "./constants.js";
import type { SecuritizeRWAFactory } from "./SecuritizeRWAFactory.js";

const abi = iSecuritizeDegenNFTAbi;
type abi = typeof abi;

/**
 * Securitize always has a factory, which deploys this NFT. DS-token data,
 * registrars and cached signatures live here; the factory only builds txs
 * and looks up investor/wallet addresses.
 */
export class SecuritizeDegenNFT
  extends BaseContract<abi>
  implements IDegenNFT<"securitize">
{
  public readonly protocol = "securitize" as const;
  public readonly registrationLink = KYC_REGISTRATION_LINKS.securitize;
  public readonly factory: SecuritizeRWAFactory;
  readonly #sdk: OnchainSDK;

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
    this.#sdk = sdk;
    this.factory = factory;
  }

  public async getTokens(): Promise<Address[]> {
    return this.factory.getTokens();
  }

  /**
   * Registration on Securitize is the protocol-side KYC step; pending
   * EIP-712 signatures are tx-side leftover, not KYC.
   */
  public async getOpenAccountRequirements(
    wallet: Address,
    props: GetOpenAccountRequirementsProps,
  ): Promise<SecuritizeOpenAccountRequirements> {
    const dsTokens = new AddressSet(this.factory.getTokens());
    const tokensToRegister = dsTokens.has(props.tokenOutAddress)
      ? new AddressSet([props.tokenOutAddress])
      : new AddressSet();
    if (tokensToRegister.size === 0) {
      return {
        protocol: "securitize",
        factory: this.factory.address,
        securitizeTokensToRegister: [],
        tokensToRegister: [],
        requiredSignatures: [],
      };
    }

    const [investorData] = await this.#sdk.rwa.getInvestorData(wallet, [
      this.factory.address,
    ]);
    const registredTokens = new AddressSet(investorData.registeredTokens);
    const signedTokens = new AddressSet(
      investorData.cachedSignatures.map(s => s.token),
    );
    const unsignedTokens = tokensToRegister.difference(signedTokens);

    const securitizeTokensToRegister =
      tokensToRegister.difference(registredTokens);
    const requiredSignatures = investorData.registerVaultMessages.filter(m =>
      unsignedTokens.has(m.message.token),
    );

    return {
      protocol: "securitize",
      factory: this.factory.address,
      securitizeTokensToRegister: Array.from(securitizeTokensToRegister),
      tokensToRegister: Array.from(tokensToRegister),
      requiredSignatures,
    };
  }

  public isRegistered(
    requirements: SecuritizeOpenAccountRequirements,
  ): boolean {
    return requirements.securitizeTokensToRegister.length === 0;
  }

  /**
   * A required signature is omitted when `providedArgs.signaturesToCache`
   * already carries a signature for the same token: the transaction caches it
   * on-chain as part of the operation.
   */
  public getMissingRequirements(
    requirements: SecuritizeOpenAccountRequirements,
    providedArgs?: SecuritizeOperationArgs,
  ): SecuritizeMissingOpenAccountRequirements | undefined {
    const providedTokens = new AddressSet(
      (providedArgs?.signaturesToCache ?? []).map(s => s.token),
    );
    const requiredSignatures = requirements.requiredSignatures.filter(
      message => !providedTokens.has(message.message.token),
    );
    if (requiredSignatures.length === 0) {
      return undefined;
    }
    return {
      protocol: "securitize",
      requiredSignatures,
    };
  }
}
