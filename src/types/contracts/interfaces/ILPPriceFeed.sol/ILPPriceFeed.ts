/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../../common";

export interface ILPPriceFeedInterface extends utils.Interface {
  functions: {
    "decimals()": FunctionFragment;
    "delta()": FunctionFragment;
    "description()": FunctionFragment;
    "getRoundData(uint80)": FunctionFragment;
    "latestRoundData()": FunctionFragment;
    "lowerBound()": FunctionFragment;
    "priceFeedType()": FunctionFragment;
    "setLimiter(uint256)": FunctionFragment;
    "skipPriceCheck()": FunctionFragment;
    "upperBound()": FunctionFragment;
    "version()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "decimals"
      | "delta"
      | "description"
      | "getRoundData"
      | "latestRoundData"
      | "lowerBound"
      | "priceFeedType"
      | "setLimiter"
      | "skipPriceCheck"
      | "upperBound"
      | "version",
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(functionFragment: "delta", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "description",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "getRoundData",
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: "latestRoundData",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "lowerBound",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "priceFeedType",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "setLimiter",
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: "skipPriceCheck",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "upperBound",
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "delta", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "description",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRoundData",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "latestRoundData",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "lowerBound", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "priceFeedType",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "setLimiter", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "skipPriceCheck",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "upperBound", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;

  events: {
    "NewLimiterParams(uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "NewLimiterParams"): EventFragment;
}

export interface NewLimiterParamsEventObject {
  lowerBound: BigNumber;
  upperBound: BigNumber;
}
export type NewLimiterParamsEvent = TypedEvent<
  [BigNumber, BigNumber],
  NewLimiterParamsEventObject
>;

export type NewLimiterParamsEventFilter =
  TypedEventFilter<NewLimiterParamsEvent>;

export interface ILPPriceFeed extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ILPPriceFeedInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>,
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>,
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    decimals(overrides?: CallOverrides): Promise<[number]>;

    delta(overrides?: CallOverrides): Promise<[BigNumber]>;

    description(overrides?: CallOverrides): Promise<[string]>;

    getRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    latestRoundData(overrides?: CallOverrides): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    lowerBound(overrides?: CallOverrides): Promise<[BigNumber]>;

    priceFeedType(overrides?: CallOverrides): Promise<[number]>;

    setLimiter(
      _lowerBound: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    skipPriceCheck(overrides?: CallOverrides): Promise<[boolean]>;

    upperBound(overrides?: CallOverrides): Promise<[BigNumber]>;

    version(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  decimals(overrides?: CallOverrides): Promise<number>;

  delta(overrides?: CallOverrides): Promise<BigNumber>;

  description(overrides?: CallOverrides): Promise<string>;

  getRoundData(
    _roundId: BigNumberish,
    overrides?: CallOverrides,
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      roundId: BigNumber;
      answer: BigNumber;
      startedAt: BigNumber;
      updatedAt: BigNumber;
      answeredInRound: BigNumber;
    }
  >;

  latestRoundData(overrides?: CallOverrides): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      roundId: BigNumber;
      answer: BigNumber;
      startedAt: BigNumber;
      updatedAt: BigNumber;
      answeredInRound: BigNumber;
    }
  >;

  lowerBound(overrides?: CallOverrides): Promise<BigNumber>;

  priceFeedType(overrides?: CallOverrides): Promise<number>;

  setLimiter(
    _lowerBound: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  skipPriceCheck(overrides?: CallOverrides): Promise<boolean>;

  upperBound(overrides?: CallOverrides): Promise<BigNumber>;

  version(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    decimals(overrides?: CallOverrides): Promise<number>;

    delta(overrides?: CallOverrides): Promise<BigNumber>;

    description(overrides?: CallOverrides): Promise<string>;

    getRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    latestRoundData(overrides?: CallOverrides): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    lowerBound(overrides?: CallOverrides): Promise<BigNumber>;

    priceFeedType(overrides?: CallOverrides): Promise<number>;

    setLimiter(
      _lowerBound: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<void>;

    skipPriceCheck(overrides?: CallOverrides): Promise<boolean>;

    upperBound(overrides?: CallOverrides): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    "NewLimiterParams(uint256,uint256)"(
      lowerBound?: null,
      upperBound?: null,
    ): NewLimiterParamsEventFilter;
    NewLimiterParams(
      lowerBound?: null,
      upperBound?: null,
    ): NewLimiterParamsEventFilter;
  };

  estimateGas: {
    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    delta(overrides?: CallOverrides): Promise<BigNumber>;

    description(overrides?: CallOverrides): Promise<BigNumber>;

    getRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    latestRoundData(overrides?: CallOverrides): Promise<BigNumber>;

    lowerBound(overrides?: CallOverrides): Promise<BigNumber>;

    priceFeedType(overrides?: CallOverrides): Promise<BigNumber>;

    setLimiter(
      _lowerBound: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    skipPriceCheck(overrides?: CallOverrides): Promise<BigNumber>;

    upperBound(overrides?: CallOverrides): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    delta(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    description(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    latestRoundData(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    lowerBound(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    priceFeedType(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setLimiter(
      _lowerBound: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    skipPriceCheck(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    upperBound(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
