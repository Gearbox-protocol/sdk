import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address, ContractFunctionParameters } from "viem";
import type { iKYCCompressorAbi } from "../../../abi/kyc/iKYCCompressor.js";
import type { IBaseContract, Unarray } from "../../base/index.js";
import type { MultiCall, RawTx } from "../../types/index.js";
import { KYC_FACTORY_SECURITIZE } from "./securitize/constants.js";
import type {
  SecuritizeInvestorData,
  SecuritizeKYCFactoryStateHuman,
  SecuritizeRegisterMessage,
} from "./securitize/types.js";

/**
 * Discriminated union of all known KYC factory contract type strings.
 **/
export const KYC_FACTORY_TYPES = [KYC_FACTORY_SECURITIZE] as const;

/**
 * String literal union of known KYC factory types.
 **/
export type KYCFactoryType = (typeof KYC_FACTORY_TYPES)[number];

/**
 * Raw return type of `KYCCompressor.getKYCMarketsData`.
 **/
export type KYCCompressorResponse = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof iKYCCompressorAbi, "getKYCMarketsData">["outputs"]
>;

/**
 * On-chain state of a KYC underlying token.
 **/
export type KYCUnderlyingData = Unarray<KYCCompressorResponse[0]>;

/**
 * On-chain state of a KYC factory.
 **/
export type KYCFactoryData = Unarray<KYCCompressorResponse[1]>;

/**
 * Typed contract call parameters for `KYCCompressor.getKYCMarketsData`.
 **/
export type KYCCompressorCall = ContractFunctionParameters<
  typeof iKYCCompressorAbi,
  "view",
  "getKYCMarketsData"
>;

/**
 * Single element of the `KYCCompressor.getKYCInvestorData` return array.
 * Contains per-factory credit accounts and factory-specific extra details.
 **/
export type KYCCompressorInvestorData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof iKYCCompressorAbi,
      "getKYCInvestorData"
    >["outputs"]
  >[0]
>;

/**
 * Full KYC compressor response, used as the persisted/hydrated state.
 **/
export type KYCState = KYCCompressorResponse;

/**
 * Decoded DSToken data from the SecuritizeDegenNFT contract.
 * Mirrors `ISecuritizeDegenNFT.DSTokenData`.
 **/
export interface DStokenData {
  /** DSToken address. */
  address: Address;
  /** Securitize VaultRegistrar for this token. */
  registrar: Address;
  /** Addresses authorised to register vaults for this token. */
  operators: Address[];
}

/**
 * Investor data decoded from the KYC compressor.
 **/
export type InvestorData = SecuritizeInvestorData;

/**
 * Human-readable KYC factory state.
 **/
export type KYCFactoryStateHuman = SecuritizeKYCFactoryStateHuman;

/**
 * Human-readable snapshot of the full KYC registry state.
 **/
export interface KYCStateHuman {
  /** State of each loaded KYC factory. */
  factories: KYCFactoryStateHuman[];
}

/**
 * Base type returned by {@link IKYCFactory.getOpenAccountRequirements} when an
 * investor needs to perform additional steps before opening a credit account.
 * Each KYC factory implementation extends this with factory-specific fields
 * (e.g. tokens to register, signatures to provide).
 *
 **/
export interface OpenAccountRequirements {
  /**
   * Discriminant identifying which KYC factory produced these requirements.
   */
  type: KYCFactoryType;
}

export interface IKYCFactory<
  TInvestorData,
  TOpenAccountRequirements extends OpenAccountRequirements,
> extends IBaseContract {
  /**
   * @internal
   *
   * Compressor provider encoded extra details for investor data
   * Each factory knows how to decode its own extra details
   *
   * @param data raw KYCCompressor InvestorData
   */
  decodeInvestorData(data: KYCCompressorInvestorData): TInvestorData;
  /**
   * Returns the investor address for a credit account.
   * @param creditAccount credit account address
   * @param fromCache if true, use and update an in-memory cache (creditAccount -> investor). On cache miss, loads from contract and stores the result for future calls.
   */
  getInvestor(creditAccount: Address, fromCache?: boolean): Promise<Address>;
  /**
   * Precomputes the wallet address for a credit account.
   * TODO: this is securitize-specific, but until there is no other KYC factory, we will keep it here
   * @param creditManager credit manager address
   * @param investor investor address
   */
  precomputeWalletAddress(
    creditManager: Address,
    investor: Address,
  ): Promise<Address>;
  /**
   * Returns the wallet address for a credit account.
   * Wallet is a smart contract that owns the credit account, and
   * it is different from the investor address (actual user)
   * @param creditAccount credit account address
   */
  getWallet(creditAccount: Address): Promise<Address>;
  /**
   * Creates a raw transaction to perform operations on a credit account.
   * Similar to {@link CreditFacadeV310Contract.multicall}
   *
   * @param creditAccount credit account address
   * @param calls calls to perform
   * @param tokensToRegister - TODO: this is securitize-specific, but until there is no other KYC factory, we will keep it here
   * @param signaturesToCache - TODO: this is securitize-specific, but until there is no other KYC factory, we will keep it here
   */
  multicall(
    creditAccount: Address,
    calls: MultiCall[],
    tokensToRegister: Address[],
    signaturesToCache: SecuritizeRegisterMessage[],
  ): RawTx;
  /**
   * Checks if the user can open a credit account with this factory.
   * TODO: there should be one more parameter with desired strategy - e.g. tokensToRegister for securitize
   * @param investor investor address
   * @returns open account requirements for the investor or undefined if the user can open a credit account without any further actions
   */
  getOpenAccountRequirements(
    investor: Address,
  ): Promise<TOpenAccountRequirements | undefined>;
  /**
   * Creates a raw transaction to open a credit account.
   * Similar to {@link CreditFacadeV310Contract.openCreditAccount}
   * @param creditManager credit manager address
   * @param calls initial calls to perform
   * @param tokensToRegister - TODO: this is securitize-specific, but until there is no other KYC factory, we will keep it here
   * @param signaturesToCache - TODO: this is securitize-specific, but until there is no other KYC factory, we will keep it here
   */
  openCreditAccount(
    creditManager: Address,
    calls: MultiCall[],
    tokensToRegister: Address[],
    signaturesToCache: SecuritizeRegisterMessage[],
  ): RawTx;
}
