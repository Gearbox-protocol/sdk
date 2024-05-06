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

export interface IPriceOracleV2ExtInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "addPriceFeed"
      | "convert"
      | "convertFromUSD"
      | "convertToUSD"
      | "fastCheck"
      | "getPrice"
      | "priceFeeds"
      | "priceFeedsWithFlags"
      | "version"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "NewPriceFeed"): EventFragment;

  encodeFunctionData(
    functionFragment: "addPriceFeed",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "convert",
    values: [BigNumberish, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "convertFromUSD",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "convertToUSD",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "fastCheck",
    values: [BigNumberish, AddressLike, BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getPrice",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "priceFeeds",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "priceFeedsWithFlags",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "addPriceFeed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "convert", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "convertFromUSD",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "convertToUSD",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "fastCheck", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getPrice", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "priceFeeds", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "priceFeedsWithFlags",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
}

export namespace NewPriceFeedEvent {
  export type InputTuple = [token: AddressLike, priceFeed: AddressLike];
  export type OutputTuple = [token: string, priceFeed: string];
  export interface OutputObject {
    token: string;
    priceFeed: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IPriceOracleV2Ext extends BaseContract {
  connect(runner?: ContractRunner | null): IPriceOracleV2Ext;
  waitForDeployment(): Promise<this>;

  interface: IPriceOracleV2ExtInterface;

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

  addPriceFeed: TypedContractMethod<
    [token: AddressLike, priceFeed: AddressLike],
    [void],
    "nonpayable"
  >;

  convert: TypedContractMethod<
    [amount: BigNumberish, tokenFrom: AddressLike, tokenTo: AddressLike],
    [bigint],
    "view"
  >;

  convertFromUSD: TypedContractMethod<
    [amount: BigNumberish, token: AddressLike],
    [bigint],
    "view"
  >;

  convertToUSD: TypedContractMethod<
    [amount: BigNumberish, token: AddressLike],
    [bigint],
    "view"
  >;

  fastCheck: TypedContractMethod<
    [
      amountFrom: BigNumberish,
      tokenFrom: AddressLike,
      amountTo: BigNumberish,
      tokenTo: AddressLike
    ],
    [[bigint, bigint] & { collateralFrom: bigint; collateralTo: bigint }],
    "view"
  >;

  getPrice: TypedContractMethod<[token: AddressLike], [bigint], "view">;

  priceFeeds: TypedContractMethod<[token: AddressLike], [string], "view">;

  priceFeedsWithFlags: TypedContractMethod<
    [token: AddressLike],
    [
      [string, boolean, bigint] & {
        priceFeed: string;
        skipCheck: boolean;
        decimals: bigint;
      }
    ],
    "view"
  >;

  version: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "addPriceFeed"
  ): TypedContractMethod<
    [token: AddressLike, priceFeed: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "convert"
  ): TypedContractMethod<
    [amount: BigNumberish, tokenFrom: AddressLike, tokenTo: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "convertFromUSD"
  ): TypedContractMethod<
    [amount: BigNumberish, token: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "convertToUSD"
  ): TypedContractMethod<
    [amount: BigNumberish, token: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "fastCheck"
  ): TypedContractMethod<
    [
      amountFrom: BigNumberish,
      tokenFrom: AddressLike,
      amountTo: BigNumberish,
      tokenTo: AddressLike
    ],
    [[bigint, bigint] & { collateralFrom: bigint; collateralTo: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "getPrice"
  ): TypedContractMethod<[token: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "priceFeeds"
  ): TypedContractMethod<[token: AddressLike], [string], "view">;
  getFunction(
    nameOrSignature: "priceFeedsWithFlags"
  ): TypedContractMethod<
    [token: AddressLike],
    [
      [string, boolean, bigint] & {
        priceFeed: string;
        skipCheck: boolean;
        decimals: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "version"
  ): TypedContractMethod<[], [bigint], "view">;

  getEvent(
    key: "NewPriceFeed"
  ): TypedContractEvent<
    NewPriceFeedEvent.InputTuple,
    NewPriceFeedEvent.OutputTuple,
    NewPriceFeedEvent.OutputObject
  >;

  filters: {
    "NewPriceFeed(address,address)": TypedContractEvent<
      NewPriceFeedEvent.InputTuple,
      NewPriceFeedEvent.OutputTuple,
      NewPriceFeedEvent.OutputObject
    >;
    NewPriceFeed: TypedContractEvent<
      NewPriceFeedEvent.InputTuple,
      NewPriceFeedEvent.OutputTuple,
      NewPriceFeedEvent.OutputObject
    >;
  };
}
