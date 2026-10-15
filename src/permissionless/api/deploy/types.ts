import type { Address, Hex } from "viem";
import type { RawTx } from "../../../onchain/index.js";
import type { InputValueParams } from "../../core/index.js";
import type { FunctionParams } from "../../utils/abi-encoder.js";

/**
 * What both deploy flows name: which chain to read, and who the deployer is.
 * `owner` goes into the CREATE2 derivation, so it has to be the address that
 * will send {@link PreparedDeployment.tx} — anyone else's send lands on a
 * different address.
 *
 * The chain must be among the ones the client was constructed with, see
 * {@link GearboxPermissionlessOptions.chains}.
 **/
export interface DeployArgs {
  chainId: number;
  owner: Address;
  contractType: string;
  version: number;
}

/** Args of {@link PermissionlessDeploy.priceFeed}. */
export interface DeployPriceFeedArgs extends DeployArgs {
  /**
   * Constructor values keyed by the labels of the feed's
   * {@link PriceFeedSetupParams}, i.e. what a form collects.
   **/
  values: Record<string, InputValueParams>;
  /**
   * Name the feed is deployed under. Used as the CREATE2 salt unless
   * {@link salt} is given, which is what makes two feeds of the same type and
   * args land on different addresses.
   **/
  name?: string;
  /** @see {@link priceFeedSalt} for the default derived from {@link name}. */
  salt?: Hex;
}

/** Args of {@link PermissionlessDeploy.contract}. */
export interface DeployContractArgs extends DeployArgs {
  /** Constructor values as ABI type/value pairs. */
  values: FunctionParams[];
  /**
   * @defaultValue {@link DEFAULT_DEPLOY_SALT}
   **/
  salt?: Hex;
}

/**
 * A deploy that has been resolved against the chain but not sent.
 *
 * Nothing here touches a wallet: sending is left to the caller, who in a
 * browser holds the only one. A caller that signs with viem sends
 * {@link tx} through `sendRawTx`; one on wagmi can either do the same or call
 * `BytecodeRepository.deploy` itself with the fields below.
 **/
export interface PreparedDeployment {
  contractType: string;
  version: number;
  owner: Address;
  salt: Hex;
  /** ABI-encoded constructor arguments, as the repository expects them. */
  encodedParams: Hex;
  /** Where CREATE2 puts the contract for this `owner`, type, args and salt. */
  address: Address;
  /**
   * Whether that address already holds code. When it does, {@link tx} would
   * revert, and the deploy the caller wanted has already happened.
   **/
  isAlreadyDeployed: boolean;
  /** `BytecodeRepository.deploy(contractType, version, encodedParams, salt)`. */
  tx: RawTx;
}

/**
 * A prepared price feed deploy, plus the constructor values that were actually
 * encoded.
 **/
export interface PreparedPriceFeedDeployment extends PreparedDeployment {
  /**
   * {@link DeployPriceFeedArgs.values} after the bounds that had to be read
   * off the chain were filled in, see
   * {@link deriveEffectiveStalenessPeriod}. Encoding these again reproduces
   * {@link PreparedDeployment.encodedParams} byte for byte.
   **/
  values: Record<string, InputValueParams>;
}
