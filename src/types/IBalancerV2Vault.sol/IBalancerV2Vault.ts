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
  AddressLike,
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

export type BatchSwapStepStruct = {
  poolId: BytesLike;
  assetInIndex: BigNumberish;
  assetOutIndex: BigNumberish;
  amount: BigNumberish;
  userData: BytesLike;
};

export type BatchSwapStepStructOutput = [
  poolId: string,
  assetInIndex: bigint,
  assetOutIndex: bigint,
  amount: bigint,
  userData: string
] & {
  poolId: string;
  assetInIndex: bigint;
  assetOutIndex: bigint;
  amount: bigint;
  userData: string;
};

export type FundManagementStruct = {
  sender: AddressLike;
  fromInternalBalance: boolean;
  recipient: AddressLike;
  toInternalBalance: boolean;
};

export type FundManagementStructOutput = [
  sender: string,
  fromInternalBalance: boolean,
  recipient: string,
  toInternalBalance: boolean
] & {
  sender: string;
  fromInternalBalance: boolean;
  recipient: string;
  toInternalBalance: boolean;
};

export type ExitPoolRequestStruct = {
  assets: AddressLike[];
  minAmountsOut: BigNumberish[];
  userData: BytesLike;
  toInternalBalance: boolean;
};

export type ExitPoolRequestStructOutput = [
  assets: string[],
  minAmountsOut: bigint[],
  userData: string,
  toInternalBalance: boolean
] & {
  assets: string[];
  minAmountsOut: bigint[];
  userData: string;
  toInternalBalance: boolean;
};

export type JoinPoolRequestStruct = {
  assets: AddressLike[];
  maxAmountsIn: BigNumberish[];
  userData: BytesLike;
  fromInternalBalance: boolean;
};

export type JoinPoolRequestStructOutput = [
  assets: string[],
  maxAmountsIn: bigint[],
  userData: string,
  fromInternalBalance: boolean
] & {
  assets: string[];
  maxAmountsIn: bigint[];
  userData: string;
  fromInternalBalance: boolean;
};

export type SingleSwapStruct = {
  poolId: BytesLike;
  kind: BigNumberish;
  assetIn: AddressLike;
  assetOut: AddressLike;
  amount: BigNumberish;
  userData: BytesLike;
};

export type SingleSwapStructOutput = [
  poolId: string,
  kind: bigint,
  assetIn: string,
  assetOut: string,
  amount: bigint,
  userData: string
] & {
  poolId: string;
  kind: bigint;
  assetIn: string;
  assetOut: string;
  amount: bigint;
  userData: string;
};

export interface IBalancerV2VaultInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "batchSwap"
      | "exitPool"
      | "getPool"
      | "getPoolTokenInfo"
      | "getPoolTokens"
      | "joinPool"
      | "queryBatchSwap"
      | "swap"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "batchSwap",
    values: [
      BigNumberish,
      BatchSwapStepStruct[],
      AddressLike[],
      FundManagementStruct,
      BigNumberish[],
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "exitPool",
    values: [BytesLike, AddressLike, AddressLike, ExitPoolRequestStruct]
  ): string;
  encodeFunctionData(functionFragment: "getPool", values: [BytesLike]): string;
  encodeFunctionData(
    functionFragment: "getPoolTokenInfo",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getPoolTokens",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "joinPool",
    values: [BytesLike, AddressLike, AddressLike, JoinPoolRequestStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "queryBatchSwap",
    values: [
      BigNumberish,
      BatchSwapStepStruct[],
      AddressLike[],
      FundManagementStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [SingleSwapStruct, FundManagementStruct, BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "batchSwap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "exitPool", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getPool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPoolTokenInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPoolTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "joinPool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "queryBatchSwap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;
}

export interface IBalancerV2Vault extends BaseContract {
  connect(runner?: ContractRunner | null): IBalancerV2Vault;
  waitForDeployment(): Promise<this>;

  interface: IBalancerV2VaultInterface;

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

  batchSwap: TypedContractMethod<
    [
      kind: BigNumberish,
      swaps: BatchSwapStepStruct[],
      assets: AddressLike[],
      funds: FundManagementStruct,
      limits: BigNumberish[],
      deadline: BigNumberish
    ],
    [bigint[]],
    "nonpayable"
  >;

  exitPool: TypedContractMethod<
    [
      poolId: BytesLike,
      sender: AddressLike,
      recipient: AddressLike,
      request: ExitPoolRequestStruct
    ],
    [void],
    "nonpayable"
  >;

  getPool: TypedContractMethod<[poolId: BytesLike], [[string, bigint]], "view">;

  getPoolTokenInfo: TypedContractMethod<
    [poolId: BytesLike, token: AddressLike],
    [
      [bigint, bigint, bigint, string] & {
        cash: bigint;
        managed: bigint;
        lastChangeBlock: bigint;
        assetManager: string;
      }
    ],
    "view"
  >;

  getPoolTokens: TypedContractMethod<
    [poolId: BytesLike],
    [
      [string[], bigint[], bigint] & {
        tokens: string[];
        balances: bigint[];
        lastChangeBlock: bigint;
      }
    ],
    "view"
  >;

  joinPool: TypedContractMethod<
    [
      poolId: BytesLike,
      sender: AddressLike,
      recipient: AddressLike,
      request: JoinPoolRequestStruct
    ],
    [void],
    "nonpayable"
  >;

  queryBatchSwap: TypedContractMethod<
    [
      kind: BigNumberish,
      swaps: BatchSwapStepStruct[],
      assets: AddressLike[],
      funds: FundManagementStruct
    ],
    [bigint[]],
    "nonpayable"
  >;

  swap: TypedContractMethod<
    [
      singleSwap: SingleSwapStruct,
      funds: FundManagementStruct,
      limit: BigNumberish,
      deadline: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "batchSwap"
  ): TypedContractMethod<
    [
      kind: BigNumberish,
      swaps: BatchSwapStepStruct[],
      assets: AddressLike[],
      funds: FundManagementStruct,
      limits: BigNumberish[],
      deadline: BigNumberish
    ],
    [bigint[]],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "exitPool"
  ): TypedContractMethod<
    [
      poolId: BytesLike,
      sender: AddressLike,
      recipient: AddressLike,
      request: ExitPoolRequestStruct
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getPool"
  ): TypedContractMethod<[poolId: BytesLike], [[string, bigint]], "view">;
  getFunction(
    nameOrSignature: "getPoolTokenInfo"
  ): TypedContractMethod<
    [poolId: BytesLike, token: AddressLike],
    [
      [bigint, bigint, bigint, string] & {
        cash: bigint;
        managed: bigint;
        lastChangeBlock: bigint;
        assetManager: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getPoolTokens"
  ): TypedContractMethod<
    [poolId: BytesLike],
    [
      [string[], bigint[], bigint] & {
        tokens: string[];
        balances: bigint[];
        lastChangeBlock: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "joinPool"
  ): TypedContractMethod<
    [
      poolId: BytesLike,
      sender: AddressLike,
      recipient: AddressLike,
      request: JoinPoolRequestStruct
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "queryBatchSwap"
  ): TypedContractMethod<
    [
      kind: BigNumberish,
      swaps: BatchSwapStepStruct[],
      assets: AddressLike[],
      funds: FundManagementStruct
    ],
    [bigint[]],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "swap"
  ): TypedContractMethod<
    [
      singleSwap: SingleSwapStruct,
      funds: FundManagementStruct,
      limit: BigNumberish,
      deadline: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;

  filters: {};
}