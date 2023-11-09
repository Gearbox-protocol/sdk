/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export interface IUpdatablePriceFeedInterface extends utils.Interface {
  functions: {
    "decimals()": FunctionFragment;
    "description()": FunctionFragment;
    "latestRoundData()": FunctionFragment;
    "priceFeedType()": FunctionFragment;
    "skipPriceCheck()": FunctionFragment;
    "updatable()": FunctionFragment;
    "updatePrice(bytes)": FunctionFragment;
    "version()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "decimals"
      | "description"
      | "latestRoundData"
      | "priceFeedType"
      | "skipPriceCheck"
      | "updatable"
      | "updatePrice"
      | "version"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "description",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "latestRoundData",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "priceFeedType",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "skipPriceCheck",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "updatable", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "updatePrice",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "description",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "latestRoundData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "priceFeedType",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "skipPriceCheck",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "updatable", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "updatePrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;

  events: {};
}

export interface IUpdatablePriceFeed extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IUpdatablePriceFeedInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    decimals(overrides?: CallOverrides): Promise<[number]>;

    description(overrides?: CallOverrides): Promise<[string]>;

    latestRoundData(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        answer: BigNumber;
        updatedAt: BigNumber;
      }
    >;

    priceFeedType(overrides?: CallOverrides): Promise<[number]>;

    skipPriceCheck(overrides?: CallOverrides): Promise<[boolean]>;

    updatable(overrides?: CallOverrides): Promise<[boolean]>;

    updatePrice(
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    version(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  decimals(overrides?: CallOverrides): Promise<number>;

  description(overrides?: CallOverrides): Promise<string>;

  latestRoundData(
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      answer: BigNumber;
      updatedAt: BigNumber;
    }
  >;

  priceFeedType(overrides?: CallOverrides): Promise<number>;

  skipPriceCheck(overrides?: CallOverrides): Promise<boolean>;

  updatable(overrides?: CallOverrides): Promise<boolean>;

  updatePrice(
    data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  version(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    decimals(overrides?: CallOverrides): Promise<number>;

    description(overrides?: CallOverrides): Promise<string>;

    latestRoundData(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        answer: BigNumber;
        updatedAt: BigNumber;
      }
    >;

    priceFeedType(overrides?: CallOverrides): Promise<number>;

    skipPriceCheck(overrides?: CallOverrides): Promise<boolean>;

    updatable(overrides?: CallOverrides): Promise<boolean>;

    updatePrice(
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    description(overrides?: CallOverrides): Promise<BigNumber>;

    latestRoundData(overrides?: CallOverrides): Promise<BigNumber>;

    priceFeedType(overrides?: CallOverrides): Promise<BigNumber>;

    skipPriceCheck(overrides?: CallOverrides): Promise<BigNumber>;

    updatable(overrides?: CallOverrides): Promise<BigNumber>;

    updatePrice(
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    description(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    latestRoundData(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    priceFeedType(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    skipPriceCheck(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updatable(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updatePrice(
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}