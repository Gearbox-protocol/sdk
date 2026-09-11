import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address, ContractFunctionParameters } from "viem";
import type { iRWACompressorAbi } from "../../../abi/rwa/iRWACompressor.js";
import {
  RWA_FACTORY_SECURITIZE,
  type RWAFactoryType,
  type RWAMissingOpenAccountRequirements,
  type RWAOpenAccountRequirements,
  type RWAOperationArgs,
  type RWAProtocol,
} from "../../../model/index.js";
import type { IBaseContract, Unarray } from "../../base/index.js";
import type { MultiCall, RawTx } from "../../types/index.js";
import type {
  SecuritizeInvestorData,
  SecuritizeRWAFactoryStateHuman,
} from "./securitize/index.js";

/**
 * @internal
 *
 * Type-level registry mapping each {@link RWAFactoryType} to its associated
 * compressor / contract-state types. Adding a new RWA factory requires a
 * single new entry here; all derived types update automatically.
 **/
interface RWAFactoryTypeMap {
  [RWA_FACTORY_SECURITIZE]: {
    protocol: "securitize";
    investorData: SecuritizeInvestorData;
    stateHuman: SecuritizeRWAFactoryStateHuman;
  };
}

/**
 * {@link RWAProtocol} of the factory type `T`.
 **/
export type RWAFactoryProtocol<T extends RWAFactoryType> =
  RWAFactoryTypeMap[T]["protocol"];

/**
 * Investor data decoded from the RWA compressor, defaults to union of all factory types
 * Can be discriminated by type
 **/
export type RWAInvestorData<T extends RWAFactoryType = RWAFactoryType> =
  RWAFactoryTypeMap[T]["investorData"];

/**
 * Raw return type of `RWACompressor.getRWAMarketsData`.
 **/
export type RWACompressorResponse = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof iRWACompressorAbi, "getRWAMarketsData">["outputs"]
>;

/**
 * On-chain state of a RWA underlying token.
 **/
export type RWAUnderlyingData = Unarray<RWACompressorResponse[0]>;

/**
 * On-chain state of a RWA factory.
 **/
export type RWAFactoryData = Unarray<RWACompressorResponse[1]>;

/**
 * Typed contract call parameters for `RWACompressor.getRWAMarketsData`.
 **/
export type RWACompressorCall = ContractFunctionParameters<
  typeof iRWACompressorAbi,
  "view",
  "getRWAMarketsData"
>;

/**
 * Single element of the `RWACompressor.getRWAInvestorData` return array.
 * Contains per-factory credit accounts and factory-specific extra details.
 **/
export type RWACompressorInvestorData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof iRWACompressorAbi,
      "getRWAInvestorData"
    >["outputs"]
  >[0]
>;

/**
 * Full RWA compressor response, used as the persisted/hydrated state.
 **/
export type RWAState = RWACompressorResponse;

/**
 * Human-readable RWA factory state, union of all factory types.
 **/
export type RWAFactoryStateHuman =
  RWAFactoryTypeMap[RWAFactoryType]["stateHuman"];

/**
 * Human-readable snapshot of the full RWA registry state.
 **/
export interface RWAStateHuman {
  /** State of each loaded RWA factory. */
  factories: RWAFactoryStateHuman[];
}

/**
 * Options to get open account requirements
 * Compatible with StrategyConfigPayload
 */
export interface GetOpenAccountRequirementsProps {
  /**
   * Token address of the strategy
   */
  tokenOutAddress: Address;
}

/**
 * Options for {@link IRWAFactory.getInvestor}.
 */
export interface GetInvestorOptions {
  /**
   * If true, use and update an in-memory cache (creditAccount → investor).
   * On cache miss, loads from contract and stores the result.
   **/
  fromCache?: boolean;
  /**
   * Block to read at, defaults to latest. Only used on a cache miss.
   **/
  blockNumber?: bigint;
}

/**
 * Shared interface for all RWA factory contracts.
 *
 * Parameterised by a single factory type literal `T` which indexes into
 * {@link RWAFactoryTypeMap} to derive all associated data types.
 *
 * @typeParam T - factory type
 **/
export interface IRWAFactory<T extends RWAFactoryType = RWAFactoryType>
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
   * @param data - raw RWACompressor InvestorData
   **/
  decodeInvestorData(data: RWACompressorInvestorData): RWAInvestorData<T>;
  /**
   * Returns the RWA token addresses this factory can register/gate
   * (e.g. Securitize DSTokens). Named for parity with the Solidity
   * `IRWAFactory` contract.
   **/
  getTokens(): Address[];
  /**
   * Returns the investor address for a credit account.
   * @param creditAccount - credit account address
   * @param options - cache and block-pinning options
   **/
  getInvestor(
    creditAccount: Address,
    options?: GetInvestorOptions,
  ): Promise<Address>;
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
   * @param args - factory-specific args (e.g. tokens to register, signatures to cache).
   *   Undefined value means that no RWA actions are required
   **/
  multicall(
    creditAccount: Address,
    calls: MultiCall[],
    args?: RWAOperationArgs<RWAFactoryProtocol<T>>,
  ): RawTx;
  /**
   * Creates a raw transaction to open a credit account.
   * Similar to {@link CreditFacadeV310Contract.openCreditAccount}.
   *
   * @param creditManager - credit manager address
   * @param calls - initial calls to perform
   * @param args - factory-specific args (e.g. tokens to register, signatures to cache).
   * Undefined value means that no RWA actions are required (e.g. when we open second credit account)
   **/
  openCreditAccount(
    creditManager: Address,
    calls: MultiCall[],
    args?: RWAOperationArgs<RWAFactoryProtocol<T>>,
  ): RawTx;
  /**
   * Degen NFT this factory deploys as the KYC gate. Midas has no factory;
   * its NFT is loaded separately via {@link createDegenNFT}.
   **/
  readonly degenNFT: IDegenNFT<RWAFactoryProtocol<T>>;
}

/**
 * Degen NFT that gates credit-account opening behind an RWA KYC provider.
 **/
export interface IDegenNFT<P extends RWAProtocol = RWAProtocol>
  extends IBaseContract {
  readonly protocol: P;
  readonly registrationLink: string;
  /**
   * Tokens this gate is about: Securitize DS tokens, or the Midas mToken.
   */
  getTokens(): Promise<Address[]>;
  /**
   * What `wallet` still has to do before this gate lets it open on the
   * strategy token in `props`.
   */
  getOpenAccountRequirements(
    wallet: Address,
    props: GetOpenAccountRequirementsProps,
  ): Promise<RWAOpenAccountRequirements<P>>;
  /**
   * Protocol-side KYC is done: registered at Securitize for every requested
   * DS token, or greenlisted by Midas.
   *
   * User might still be required to do additional actions on Gearbox side,
   * e.g. sign EIP-712 messages for Securitize
   */
  isRegistered(requirements: RWAOpenAccountRequirements<P>): boolean;
  /**
   * Leftover Gearbox-tx work given `providedArgs` already on the calldata.
   * Always `undefined` for Midas (no tx args).
   */
  getMissingRequirements(
    requirements: RWAOpenAccountRequirements<P>,
    providedArgs?: RWAOperationArgs<P>,
  ): RWAMissingOpenAccountRequirements<P> | undefined;
}

/**
 * Narrows any contract to an {@link IRWAFactory}.
 *
 * @param contract - contract instance to check
 * @param type - optional expected factory type literal. When provided, narrows
 *   to the concrete `IRWAFactory<T>`; when omitted, narrows to the
 *   generalized {@link IRWAFactory}
 * @returns `true` if the contract is an RWA factory (of the given type, if provided)
 **/
export function isRWAFactory<T extends RWAFactoryType = RWAFactoryType>(
  contract: IBaseContract,
  type?: T,
): contract is IRWAFactory<T> {
  if (type) {
    return contract.contractType === type;
  }
  return contract.contractType.startsWith("RWA_FACTORY::");
}
