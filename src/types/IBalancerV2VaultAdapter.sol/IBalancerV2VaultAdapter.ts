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

export type SingleSwapDiffStruct = {
  poolId: BytesLike;
  leftoverAmount: BigNumberish;
  assetIn: AddressLike;
  assetOut: AddressLike;
  userData: BytesLike;
};

export type SingleSwapDiffStructOutput = [
  poolId: string,
  leftoverAmount: bigint,
  assetIn: string,
  assetOut: string,
  userData: string
] & {
  poolId: string;
  leftoverAmount: bigint;
  assetIn: string;
  assetOut: string;
  userData: string;
};

export interface IBalancerV2VaultAdapterInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "_gearboxAdapterType"
      | "_gearboxAdapterVersion"
      | "addressProvider"
      | "batchSwap"
      | "creditManager"
      | "exitPool"
      | "exitPoolSingleAsset"
      | "exitPoolSingleAssetDiff"
      | "joinPool"
      | "joinPoolSingleAsset"
      | "joinPoolSingleAssetDiff"
      | "poolStatus"
      | "setPoolStatus"
      | "swap"
      | "swapDiff"
      | "targetContract"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "SetPoolStatus"): EventFragment;

  encodeFunctionData(
    functionFragment: "_gearboxAdapterType",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_gearboxAdapterVersion",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "addressProvider",
    values?: undefined
  ): string;
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
    functionFragment: "creditManager",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "exitPool",
    values: [BytesLike, AddressLike, AddressLike, ExitPoolRequestStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "exitPoolSingleAsset",
    values: [BytesLike, AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "exitPoolSingleAssetDiff",
    values: [BytesLike, AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "joinPool",
    values: [BytesLike, AddressLike, AddressLike, JoinPoolRequestStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "joinPoolSingleAsset",
    values: [BytesLike, AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "joinPoolSingleAssetDiff",
    values: [BytesLike, AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "poolStatus",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setPoolStatus",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [SingleSwapStruct, FundManagementStruct, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "swapDiff",
    values: [SingleSwapDiffStruct, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "targetContract",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "_gearboxAdapterType",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_gearboxAdapterVersion",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "addressProvider",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "batchSwap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "creditManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "exitPool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "exitPoolSingleAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exitPoolSingleAssetDiff",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "joinPool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "joinPoolSingleAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "joinPoolSingleAssetDiff",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "poolStatus", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setPoolStatus",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "swapDiff", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "targetContract",
    data: BytesLike
  ): Result;
}

export namespace SetPoolStatusEvent {
  export type InputTuple = [poolId: BytesLike, newStatus: BigNumberish];
  export type OutputTuple = [poolId: string, newStatus: bigint];
  export interface OutputObject {
    poolId: string;
    newStatus: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IBalancerV2VaultAdapter extends BaseContract {
  connect(runner?: ContractRunner | null): IBalancerV2VaultAdapter;
  waitForDeployment(): Promise<this>;

  interface: IBalancerV2VaultAdapterInterface;

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

  _gearboxAdapterType: TypedContractMethod<[], [bigint], "view">;

  _gearboxAdapterVersion: TypedContractMethod<[], [bigint], "view">;

  addressProvider: TypedContractMethod<[], [string], "view">;

  batchSwap: TypedContractMethod<
    [
      kind: BigNumberish,
      swaps: BatchSwapStepStruct[],
      assets: AddressLike[],
      arg3: FundManagementStruct,
      limits: BigNumberish[],
      deadline: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  creditManager: TypedContractMethod<[], [string], "view">;

  exitPool: TypedContractMethod<
    [
      poolId: BytesLike,
      arg1: AddressLike,
      arg2: AddressLike,
      request: ExitPoolRequestStruct
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  exitPoolSingleAsset: TypedContractMethod<
    [
      poolId: BytesLike,
      assetOut: AddressLike,
      amountIn: BigNumberish,
      minAmountOut: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  exitPoolSingleAssetDiff: TypedContractMethod<
    [
      poolId: BytesLike,
      assetOut: AddressLike,
      leftoverAmount: BigNumberish,
      minRateRAY: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  joinPool: TypedContractMethod<
    [
      poolId: BytesLike,
      arg1: AddressLike,
      arg2: AddressLike,
      request: JoinPoolRequestStruct
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  joinPoolSingleAsset: TypedContractMethod<
    [
      poolId: BytesLike,
      assetIn: AddressLike,
      amountIn: BigNumberish,
      minAmountOut: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  joinPoolSingleAssetDiff: TypedContractMethod<
    [
      poolId: BytesLike,
      assetIn: AddressLike,
      leftoverAmount: BigNumberish,
      minRateRAY: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  poolStatus: TypedContractMethod<[poolId: BytesLike], [bigint], "view">;

  setPoolStatus: TypedContractMethod<
    [poolId: BytesLike, newStatus: BigNumberish],
    [void],
    "nonpayable"
  >;

  swap: TypedContractMethod<
    [
      singleSwap: SingleSwapStruct,
      arg1: FundManagementStruct,
      limit: BigNumberish,
      deadline: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  swapDiff: TypedContractMethod<
    [
      singleSwapDiff: SingleSwapDiffStruct,
      limitRateRAY: BigNumberish,
      deadline: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  targetContract: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "_gearboxAdapterType"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "_gearboxAdapterVersion"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "addressProvider"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "batchSwap"
  ): TypedContractMethod<
    [
      kind: BigNumberish,
      swaps: BatchSwapStepStruct[],
      assets: AddressLike[],
      arg3: FundManagementStruct,
      limits: BigNumberish[],
      deadline: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "creditManager"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "exitPool"
  ): TypedContractMethod<
    [
      poolId: BytesLike,
      arg1: AddressLike,
      arg2: AddressLike,
      request: ExitPoolRequestStruct
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "exitPoolSingleAsset"
  ): TypedContractMethod<
    [
      poolId: BytesLike,
      assetOut: AddressLike,
      amountIn: BigNumberish,
      minAmountOut: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "exitPoolSingleAssetDiff"
  ): TypedContractMethod<
    [
      poolId: BytesLike,
      assetOut: AddressLike,
      leftoverAmount: BigNumberish,
      minRateRAY: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "joinPool"
  ): TypedContractMethod<
    [
      poolId: BytesLike,
      arg1: AddressLike,
      arg2: AddressLike,
      request: JoinPoolRequestStruct
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "joinPoolSingleAsset"
  ): TypedContractMethod<
    [
      poolId: BytesLike,
      assetIn: AddressLike,
      amountIn: BigNumberish,
      minAmountOut: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "joinPoolSingleAssetDiff"
  ): TypedContractMethod<
    [
      poolId: BytesLike,
      assetIn: AddressLike,
      leftoverAmount: BigNumberish,
      minRateRAY: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "poolStatus"
  ): TypedContractMethod<[poolId: BytesLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "setPoolStatus"
  ): TypedContractMethod<
    [poolId: BytesLike, newStatus: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "swap"
  ): TypedContractMethod<
    [
      singleSwap: SingleSwapStruct,
      arg1: FundManagementStruct,
      limit: BigNumberish,
      deadline: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "swapDiff"
  ): TypedContractMethod<
    [
      singleSwapDiff: SingleSwapDiffStruct,
      limitRateRAY: BigNumberish,
      deadline: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "targetContract"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "SetPoolStatus"
  ): TypedContractEvent<
    SetPoolStatusEvent.InputTuple,
    SetPoolStatusEvent.OutputTuple,
    SetPoolStatusEvent.OutputObject
  >;

  filters: {
    "SetPoolStatus(bytes32,uint8)": TypedContractEvent<
      SetPoolStatusEvent.InputTuple,
      SetPoolStatusEvent.OutputTuple,
      SetPoolStatusEvent.OutputObject
    >;
    SetPoolStatus: TypedContractEvent<
      SetPoolStatusEvent.InputTuple,
      SetPoolStatusEvent.OutputTuple,
      SetPoolStatusEvent.OutputObject
    >;
  };
}