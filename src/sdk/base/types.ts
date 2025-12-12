import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address, Hex } from "viem";
import type { creditAccountCompressorAbi } from "../../abi/compressors/creditAccountCompressor.js";
import type { gaugeCompressorAbi } from "../../abi/compressors/gaugeCompressor.js";
import type { marketCompressorAbi } from "../../abi/compressors/marketCompressor.js";
import type { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import type { rewardsCompressorAbi } from "../../abi/compressors/rewardsCompressor.js";

export type Unarray<A> = A extends readonly unknown[] ? Unarray<A[number]> : A;

export interface BaseParams {
  addr: Address;
  version: bigint;
  contractType: Hex;
  serializedParams: Hex;
}

export interface BaseState {
  baseParams: BaseParams;
}

export type MarketFilter = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof marketCompressorAbi, "getMarkets">["inputs"]
>[0];

export type CreditAccountData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof creditAccountCompressorAbi,
      "getCreditAccountData"
    >["outputs"]
  >
>;

export type RewardInfo = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof rewardsCompressorAbi, "getRewards">["outputs"]
  >
>;

export type MarketData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof marketCompressorAbi, "getMarkets">["outputs"]
  >
>;

export type GaugeData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof gaugeCompressorAbi, "getGaugeInfo">["outputs"]
  >
>;

export type ConnectedBotData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof peripheryCompressorAbi,
      "getConnectedBots"
    >["outputs"]
  >
>;

export type CreditSuiteState = Unarray<MarketData["creditManagers"]>;
export type CreditManagerState = CreditSuiteState["creditManager"];
export type CreditFacadeState = CreditSuiteState["creditFacade"];
export type CreditConfiguratorState = CreditSuiteState["creditConfigurator"];
export type AdapterData = Unarray<CreditSuiteState["adapters"]>;

export type TokenMetaData = Unarray<MarketData["tokens"]>;
export type PoolState = MarketData["pool"];
export type QuotaKeeperState = MarketData["quotaKeeper"];
export type QuotaState = Unarray<QuotaKeeperState["quotas"]>;
export type RateKeeperState = MarketData["rateKeeper"];
export type PriceOracleData = MarketData["priceOracle"];
export type PriceFeedMapEntry = Unarray<PriceOracleData["priceFeedMap"]>;
export type PriceFeedTreeNode = Unarray<PriceOracleData["priceFeedTree"]>;
export type PriceFeedAnswer = PriceFeedTreeNode["answer"];
export type CreditManagerDebtParams = Unarray<
  PoolState["creditManagerDebtParams"]
>;

export enum VotingContractStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  UNVOTE_ONLY = 2,
}

// TODO: make this into recursive type
export type ParsedCallArgs = Record<string, string>;

export interface ParsedCall {
  chainId: number;
  target: Address;
  contractType: string;
  label: string;
  functionName: string;
  args: ParsedCallArgs;
}

export interface IBaseContract {
  /**
   * Contract address
   **/
  readonly address: Address;
  /**
   * Contract type (parsed bytes32 or empty string)
   **/
  readonly contractType: string;
  /**
   * Contract version
   **/
  readonly version: number;
  /**
   * Internal name, for labeling purposes
   * However, other contracts may add more labels, so prefer use labeling methods instead
   **/
  readonly name: string;
  /**
   * Indicates that contract state diverged from onchain state and needs to be updated
   */
  dirty: boolean;

  /**
   * Return parsed args and function name from calldata belonging to this contract
   * Target of the call is always this contract, but args can be parsed into calls to other contracts (de-facto recursive ParsedCall)
   **/
  parseFunctionData: (calldata: Hex) => ParsedCall;

  /**
   * Same as {@link parseFunctionData}, but throws if error occurs
   **/
  mustParseFunctionData: (calldata: Hex) => ParsedCall;

  /**
   * Converts contract calldata to some human-friendly string
   * This is safe function which should not throw
   **/
  stringifyFunctionData: (calldata: Hex) => string;

  /**
   * Same as {@link stringifyFunctionData}, but throws if error occurs
   **/
  mustStringifyFunctionData: (calldata: Hex) => string;
}
