/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface IUpdatablePriceFeedInterface extends Interface {
  getFunction(
    nameOrSignature:
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
    values: [BytesLike]
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
}

export interface IUpdatablePriceFeed extends BaseContract {
  connect(runner?: ContractRunner | null): IUpdatablePriceFeed;
  waitForDeployment(): Promise<this>;

  interface: IUpdatablePriceFeedInterface;

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

  decimals: TypedContractMethod<[], [bigint], "view">;

  description: TypedContractMethod<[], [string], "view">;

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

  priceFeedType: TypedContractMethod<[], [bigint], "view">;

  skipPriceCheck: TypedContractMethod<[], [boolean], "view">;

  updatable: TypedContractMethod<[], [boolean], "view">;

  updatePrice: TypedContractMethod<[data: BytesLike], [void], "nonpayable">;

  version: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "decimals"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "description"
  ): TypedContractMethod<[], [string], "view">;
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
    nameOrSignature: "priceFeedType"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "skipPriceCheck"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "updatable"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "updatePrice"
  ): TypedContractMethod<[data: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "version"
  ): TypedContractMethod<[], [bigint], "view">;

  filters: {};
}