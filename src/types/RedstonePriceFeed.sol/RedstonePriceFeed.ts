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
  AddressLike,
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

export interface RedstonePriceFeedInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "aggregateValues"
      | "dataFeedId"
      | "decimals"
      | "description"
      | "extractTimestampsAndAssertAllAreEqual"
      | "getAuthorisedSignerIndex"
      | "getDataServiceId"
      | "getUniqueSignersThreshold"
      | "lastPayloadTimestamp"
      | "lastPrice"
      | "latestRoundData"
      | "priceFeedType"
      | "signerAddress0"
      | "signerAddress1"
      | "signerAddress2"
      | "signerAddress3"
      | "signerAddress4"
      | "signerAddress5"
      | "signerAddress6"
      | "signerAddress7"
      | "signerAddress8"
      | "signerAddress9"
      | "skipPriceCheck"
      | "token"
      | "updatable"
      | "updatePrice"
      | "validateTimestamp"
      | "version"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "UpdatePrice"): EventFragment;

  encodeFunctionData(
    functionFragment: "aggregateValues",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "dataFeedId",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "description",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "extractTimestampsAndAssertAllAreEqual",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAuthorisedSignerIndex",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getDataServiceId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getUniqueSignersThreshold",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lastPayloadTimestamp",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "lastPrice", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "latestRoundData",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "priceFeedType",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "signerAddress0",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "signerAddress1",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "signerAddress2",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "signerAddress3",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "signerAddress4",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "signerAddress5",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "signerAddress6",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "signerAddress7",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "signerAddress8",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "signerAddress9",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "skipPriceCheck",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "token", values?: undefined): string;
  encodeFunctionData(functionFragment: "updatable", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "updatePrice",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "validateTimestamp",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "aggregateValues",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "dataFeedId", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "description",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "extractTimestampsAndAssertAllAreEqual",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAuthorisedSignerIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDataServiceId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUniqueSignersThreshold",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastPayloadTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lastPrice", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "latestRoundData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "priceFeedType",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "signerAddress0",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "signerAddress1",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "signerAddress2",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "signerAddress3",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "signerAddress4",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "signerAddress5",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "signerAddress6",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "signerAddress7",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "signerAddress8",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "signerAddress9",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "skipPriceCheck",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "updatable", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "updatePrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "validateTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
}

export namespace UpdatePriceEvent {
  export type InputTuple = [price: BigNumberish];
  export type OutputTuple = [price: bigint];
  export interface OutputObject {
    price: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface RedstonePriceFeed extends BaseContract {
  connect(runner?: ContractRunner | null): RedstonePriceFeed;
  waitForDeployment(): Promise<this>;

  interface: RedstonePriceFeedInterface;

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

  aggregateValues: TypedContractMethod<
    [values: BigNumberish[]],
    [bigint],
    "view"
  >;

  dataFeedId: TypedContractMethod<[], [string], "view">;

  decimals: TypedContractMethod<[], [bigint], "view">;

  description: TypedContractMethod<[], [string], "view">;

  extractTimestampsAndAssertAllAreEqual: TypedContractMethod<
    [],
    [bigint],
    "view"
  >;

  getAuthorisedSignerIndex: TypedContractMethod<
    [signerAddress: AddressLike],
    [bigint],
    "view"
  >;

  getDataServiceId: TypedContractMethod<[], [string], "view">;

  getUniqueSignersThreshold: TypedContractMethod<[], [bigint], "view">;

  lastPayloadTimestamp: TypedContractMethod<[], [bigint], "view">;

  lastPrice: TypedContractMethod<[], [bigint], "view">;

  latestRoundData: TypedContractMethod<
    [],
    [[bigint, bigint, bigint, bigint, bigint]],
    "view"
  >;

  priceFeedType: TypedContractMethod<[], [bigint], "view">;

  signerAddress0: TypedContractMethod<[], [string], "view">;

  signerAddress1: TypedContractMethod<[], [string], "view">;

  signerAddress2: TypedContractMethod<[], [string], "view">;

  signerAddress3: TypedContractMethod<[], [string], "view">;

  signerAddress4: TypedContractMethod<[], [string], "view">;

  signerAddress5: TypedContractMethod<[], [string], "view">;

  signerAddress6: TypedContractMethod<[], [string], "view">;

  signerAddress7: TypedContractMethod<[], [string], "view">;

  signerAddress8: TypedContractMethod<[], [string], "view">;

  signerAddress9: TypedContractMethod<[], [string], "view">;

  skipPriceCheck: TypedContractMethod<[], [boolean], "view">;

  token: TypedContractMethod<[], [string], "view">;

  updatable: TypedContractMethod<[], [boolean], "view">;

  updatePrice: TypedContractMethod<[data: BytesLike], [void], "nonpayable">;

  validateTimestamp: TypedContractMethod<
    [receivedTimestampMilliseconds: BigNumberish],
    [void],
    "view"
  >;

  version: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "aggregateValues"
  ): TypedContractMethod<[values: BigNumberish[]], [bigint], "view">;
  getFunction(
    nameOrSignature: "dataFeedId"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "decimals"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "description"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "extractTimestampsAndAssertAllAreEqual"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getAuthorisedSignerIndex"
  ): TypedContractMethod<[signerAddress: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getDataServiceId"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getUniqueSignersThreshold"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "lastPayloadTimestamp"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "lastPrice"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "latestRoundData"
  ): TypedContractMethod<
    [],
    [[bigint, bigint, bigint, bigint, bigint]],
    "view"
  >;
  getFunction(
    nameOrSignature: "priceFeedType"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "signerAddress0"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "signerAddress1"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "signerAddress2"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "signerAddress3"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "signerAddress4"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "signerAddress5"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "signerAddress6"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "signerAddress7"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "signerAddress8"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "signerAddress9"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "skipPriceCheck"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "token"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "updatable"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "updatePrice"
  ): TypedContractMethod<[data: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "validateTimestamp"
  ): TypedContractMethod<
    [receivedTimestampMilliseconds: BigNumberish],
    [void],
    "view"
  >;
  getFunction(
    nameOrSignature: "version"
  ): TypedContractMethod<[], [bigint], "view">;

  getEvent(
    key: "UpdatePrice"
  ): TypedContractEvent<
    UpdatePriceEvent.InputTuple,
    UpdatePriceEvent.OutputTuple,
    UpdatePriceEvent.OutputObject
  >;

  filters: {
    "UpdatePrice(uint256)": TypedContractEvent<
      UpdatePriceEvent.InputTuple,
      UpdatePriceEvent.OutputTuple,
      UpdatePriceEvent.OutputObject
    >;
    UpdatePrice: TypedContractEvent<
      UpdatePriceEvent.InputTuple,
      UpdatePriceEvent.OutputTuple,
      UpdatePriceEvent.OutputObject
    >;
  };
}