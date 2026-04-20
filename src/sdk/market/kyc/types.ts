import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address, ContractFunctionParameters } from "viem";
import type { iKYCCompressorAbi } from "../../../abi/kyc/iKYCCompressor.js";
import type { GetOpenAccountRequirementsProps } from "../../accounts/types.js";
import type { IBaseContract, Unarray } from "../../base/index.js";
import type { MultiCall, RawTx } from "../../types/index.js";
import type {
  SecuritizeInvestorData,
  SecuritizeKYCFactoryStateHuman,
  SecuritizeOpenAccountRequirements,
  SecuritizeOperationParams,
} from "./securitize/index.js";
import { KYC_FACTORY_SECURITIZE } from "./securitize/index.js";

/**
 * Discriminated union of all known KYC factory contract type strings.
 **/
export const KYC_FACTORY_TYPES = [KYC_FACTORY_SECURITIZE] as const;

/**
 * String literal union of known KYC factory types.
 **/
export type KYCFactoryType = (typeof KYC_FACTORY_TYPES)[number];

/**
 * @internal
 *
 * Type-level registry mapping each {@link KYCFactoryType} to its associated
 * data types. Adding a new KYC factory requires a single new entry here;
 * all derived types update automatically.
 **/
interface KYCFactoryTypeMap {
  [KYC_FACTORY_SECURITIZE]: {
    investorData: SecuritizeInvestorData;
    openAccountRequirements: SecuritizeOpenAccountRequirements;
    stateHuman: SecuritizeKYCFactoryStateHuman;
    operationParams: SecuritizeOperationParams;
  };
}

/**
 * Investor data decoded from the KYC compressor, defaults to union of all factory types
 **/
export type KYCInvestorData<T extends KYCFactoryType = KYCFactoryType> =
  KYCFactoryTypeMap[T]["investorData"];

/**
 * Open-account requirements for a KYC factory, defaults to union of all factory types
 **/
export type KYCOpenAccountRequirements<
  T extends KYCFactoryType = KYCFactoryType,
> = KYCFactoryTypeMap[T]["openAccountRequirements"];

/**
 * Open credit account/Multicall extra params type for a KYC factory, defaults to union of all factory types
 **/
export type KYCOperationParams<T extends KYCFactoryType = KYCFactoryType> =
  KYCFactoryTypeMap[T]["operationParams"];

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
 * Human-readable KYC factory state, union of all factory types.
 **/
export type KYCFactoryStateHuman =
  KYCFactoryTypeMap[KYCFactoryType]["stateHuman"];

/**
 * Human-readable snapshot of the full KYC registry state.
 **/
export interface KYCStateHuman {
  /** State of each loaded KYC factory. */
  factories: KYCFactoryStateHuman[];
}

/**
 * Shared interface for all KYC factory contracts.
 *
 * Parameterised by a single factory type literal `T` which indexes into
 * {@link KYCFactoryTypeMap} to derive all associated data types.
 *
 * @typeParam T - factory type
 **/
export interface IKYCFactory<T extends KYCFactoryType = KYCFactoryType>
  extends IBaseContract {
  /**
   * Narrowed factory type discriminant
   **/
  readonly contractType: T;
  /**
   * @internal
   *
   * Decodes factory-specific extra details from the compressor's investor data.
   * Each factory knows how to decode its own extra details.
   *
   * @param data - raw KYCCompressor InvestorData
   **/
  decodeInvestorData(data: KYCCompressorInvestorData): KYCInvestorData<T>;
  /**
   * Returns the investor address for a credit account.
   * @param creditAccount - credit account address
   * @param fromCache - if true, use and update an in-memory cache
   *   (creditAccount → investor). On cache miss, loads from contract and
   *   stores the result for future calls.
   **/
  getInvestor(creditAccount: Address, fromCache?: boolean): Promise<Address>;
  /**
   *  Returns address to which approval should be given on collateral token
   *
   * @param options - either `{ creditManager, creditAccount }` for an
   *   existing account or `{ creditManager, borrower }` for a new one
   **/
  getApprovalAddress(
    options:
      | { creditManager: Address; borrower: Address }
      | { creditManager: Address; creditAccount: Address },
  ): Promise<Address>;
  /**
   * Returns the wallet address for a credit account.
   * Wallet is a smart contract that owns the credit account, and
   * it is different from the investor address (actual user).
   * @param creditAccount - credit account address
   **/
  getWallet(creditAccount: Address): Promise<Address>;
  /**
   * Creates a raw transaction to perform operations on a credit account.
   * Similar to {@link CreditFacadeV310Contract.multicall}.
   *
   * @param creditAccount - credit account address
   * @param calls - calls to perform
   * @param options - factory-specific parameters (e.g. tokens to
   *   register, signatures to cache). Undefined value means that no KYC actions are required
   **/
  multicall(
    creditAccount: Address,
    calls: MultiCall[],
    options?: KYCOperationParams<T>,
  ): RawTx;
  /**
   * Checks if the user can open a credit account with this factory.
   * @param investor - investor address
   * @param props - {@link GetOpenAccountRequirementsProps}
   * @returns open account requirements for the investor, or `undefined` if the
   *   user can open a credit account without any further actions
   **/
  getOpenAccountRequirements(
    investor: Address,
    props: GetOpenAccountRequirementsProps,
  ): Promise<KYCOpenAccountRequirements<T> | undefined>;
  /**
   * Creates a raw transaction to open a credit account.
   * Similar to {@link CreditFacadeV310Contract.openCreditAccount}.
   *
   * @param creditManager - credit manager address
   * @param calls - initial calls to perform
   * @param options - factory-specific parameters (e.g. tokens to
   *   register, signatures to cache).
   * Undefined value means that no KYC actions are required (e.g. when we open second credit account)
   **/
  openCreditAccount(
    creditManager: Address,
    calls: MultiCall[],
    options?: KYCOperationParams<T>,
  ): RawTx;
}

/**
 * Narrows an {@link IKYCFactory} to a specific factory type.
 *
 * @param factory - factory instance to check
 * @param type - expected factory type literal
 * @returns `true` if `factory.factoryType === type`
 **/
export function isKYCFactory<T extends KYCFactoryType>(
  factory: IKYCFactory,
  type: T,
): factory is IKYCFactory<T> {
  return factory.contractType === type;
}
