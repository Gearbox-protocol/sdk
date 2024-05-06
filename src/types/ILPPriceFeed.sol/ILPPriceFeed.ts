/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface ILPPriceFeedInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "allowBoundsUpdate"
      | "decimals"
      | "description"
      | "forbidBoundsUpdate"
      | "getAggregatePrice"
      | "getLPExchangeRate"
      | "getScale"
      | "lastBoundsUpdate"
      | "latestRoundData"
      | "lowerBound"
      | "lpContract"
      | "lpToken"
      | "priceFeedType"
      | "priceOracle"
      | "setLimiter"
      | "skipPriceCheck"
      | "updateBounds"
      | "updateBoundsAllowed"
      | "upperBound"
      | "version"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "SetBounds" | "SetUpdateBoundsAllowed"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "allowBoundsUpdate",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "description",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "forbidBoundsUpdate",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAggregatePrice",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLPExchangeRate",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getScale", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "lastBoundsUpdate",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "latestRoundData",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lowerBound",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lpContract",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "lpToken", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "priceFeedType",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "priceOracle",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setLimiter",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "skipPriceCheck",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "updateBounds",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "updateBoundsAllowed",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "upperBound",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "allowBoundsUpdate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "description",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "forbidBoundsUpdate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAggregatePrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLPExchangeRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getScale", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "lastBoundsUpdate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "latestRoundData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lowerBound", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "lpContract", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "lpToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "priceFeedType",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "priceOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setLimiter", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "skipPriceCheck",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateBounds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateBoundsAllowed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "upperBound", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
}

export namespace SetBoundsEvent {
  export type InputTuple = [lowerBound: BigNumberish, upperBound: BigNumberish];
  export type OutputTuple = [lowerBound: bigint, upperBound: bigint];
  export interface OutputObject {
    lowerBound: bigint;
    upperBound: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetUpdateBoundsAllowedEvent {
  export type InputTuple = [allowed: boolean];
  export type OutputTuple = [allowed: boolean];
  export interface OutputObject {
    allowed: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ILPPriceFeed extends BaseContract {
  connect(runner?: ContractRunner | null): ILPPriceFeed;
  waitForDeployment(): Promise<this>;

  interface: ILPPriceFeedInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  allowBoundsUpdate: TypedContractMethod<[], [void], "nonpayable">;

  decimals: TypedContractMethod<[], [bigint], "view">;

  description: TypedContractMethod<[], [string], "view">;

  forbidBoundsUpdate: TypedContractMethod<[], [void], "nonpayable">;

  getAggregatePrice: TypedContractMethod<[], [bigint], "view">;

  getLPExchangeRate: TypedContractMethod<[], [bigint], "view">;

  getScale: TypedContractMethod<[], [bigint], "view">;

  lastBoundsUpdate: TypedContractMethod<[], [bigint], "view">;

  latestRoundData: TypedContractMethod<
    [],
    [
      [bigint, bigint, bigint, bigint, bigint] & {
        answer: bigint;
        updatedAt: bigint;
      }
    ],
    "view"
  >;

  lowerBound: TypedContractMethod<[], [bigint], "view">;

  lpContract: TypedContractMethod<[], [string], "view">;

  lpToken: TypedContractMethod<[], [string], "view">;

  priceFeedType: TypedContractMethod<[], [bigint], "view">;

  priceOracle: TypedContractMethod<[], [string], "view">;

  setLimiter: TypedContractMethod<
    [newLowerBound: BigNumberish],
    [void],
    "nonpayable"
  >;

  skipPriceCheck: TypedContractMethod<[], [boolean], "view">;

  updateBounds: TypedContractMethod<
    [updateData: BytesLike],
    [void],
    "nonpayable"
  >;

  updateBoundsAllowed: TypedContractMethod<[], [boolean], "view">;

  upperBound: TypedContractMethod<[], [bigint], "view">;

  version: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "allowBoundsUpdate"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "decimals"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "description"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "forbidBoundsUpdate"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "getAggregatePrice"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getLPExchangeRate"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getScale"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "lastBoundsUpdate"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "latestRoundData"
  ): TypedContractMethod<
    [],
    [
      [bigint, bigint, bigint, bigint, bigint] & {
        answer: bigint;
        updatedAt: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "lowerBound"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "lpContract"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "lpToken"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "priceFeedType"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "priceOracle"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "setLimiter"
  ): TypedContractMethod<[newLowerBound: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "skipPriceCheck"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "updateBounds"
  ): TypedContractMethod<[updateData: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "updateBoundsAllowed"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "upperBound"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "version"
  ): TypedContractMethod<[], [bigint], "view">;

  getEvent(
    key: "SetBounds"
  ): TypedContractEvent<
    SetBoundsEvent.InputTuple,
    SetBoundsEvent.OutputTuple,
    SetBoundsEvent.OutputObject
  >;
  getEvent(
    key: "SetUpdateBoundsAllowed"
  ): TypedContractEvent<
    SetUpdateBoundsAllowedEvent.InputTuple,
    SetUpdateBoundsAllowedEvent.OutputTuple,
    SetUpdateBoundsAllowedEvent.OutputObject
  >;

  filters: {
    "SetBounds(uint256,uint256)": TypedContractEvent<
      SetBoundsEvent.InputTuple,
      SetBoundsEvent.OutputTuple,
      SetBoundsEvent.OutputObject
    >;
    SetBounds: TypedContractEvent<
      SetBoundsEvent.InputTuple,
      SetBoundsEvent.OutputTuple,
      SetBoundsEvent.OutputObject
    >;

    "SetUpdateBoundsAllowed(bool)": TypedContractEvent<
      SetUpdateBoundsAllowedEvent.InputTuple,
      SetUpdateBoundsAllowedEvent.OutputTuple,
      SetUpdateBoundsAllowedEvent.OutputObject
    >;
    SetUpdateBoundsAllowed: TypedContractEvent<
      SetUpdateBoundsAllowedEvent.InputTuple,
      SetUpdateBoundsAllowedEvent.OutputTuple,
      SetUpdateBoundsAllowedEvent.OutputObject
    >;
  };
}
