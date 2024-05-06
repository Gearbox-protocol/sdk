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
} from "./common";

export interface ICurveV1AdapterInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "_gearboxAdapterType"
      | "_gearboxAdapterVersion"
      | "add_diff_liquidity_one_coin"
      | "add_liquidity_one_coin"
      | "addressProvider"
      | "calc_add_one_coin"
      | "creditManager"
      | "exchange(int128,int128,uint256,uint256)"
      | "exchange(uint256,uint256,uint256,uint256)"
      | "exchange_diff"
      | "exchange_diff_underlying"
      | "exchange_underlying(uint256,uint256,uint256,uint256)"
      | "exchange_underlying(int128,int128,uint256,uint256)"
      | "lpTokenMask"
      | "lp_token"
      | "metapoolBase"
      | "nCoins"
      | "remove_diff_liquidity_one_coin"
      | "remove_liquidity_one_coin(uint256,int128,uint256)"
      | "remove_liquidity_one_coin(uint256,uint256,uint256)"
      | "targetContract"
      | "token"
      | "token0"
      | "token0Mask"
      | "token1"
      | "token1Mask"
      | "token2"
      | "token2Mask"
      | "token3"
      | "token3Mask"
      | "underlying0"
      | "underlying0Mask"
      | "underlying1"
      | "underlying1Mask"
      | "underlying2"
      | "underlying2Mask"
      | "underlying3"
      | "underlying3Mask"
      | "use256"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "_gearboxAdapterType",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_gearboxAdapterVersion",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "add_diff_liquidity_one_coin",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "add_liquidity_one_coin",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "addressProvider",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "calc_add_one_coin",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "creditManager",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "exchange(int128,int128,uint256,uint256)",
    values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "exchange(uint256,uint256,uint256,uint256)",
    values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "exchange_diff",
    values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "exchange_diff_underlying",
    values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "exchange_underlying(uint256,uint256,uint256,uint256)",
    values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "exchange_underlying(int128,int128,uint256,uint256)",
    values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "lpTokenMask",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "lp_token", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "metapoolBase",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "nCoins", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "remove_diff_liquidity_one_coin",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "remove_liquidity_one_coin(uint256,int128,uint256)",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "remove_liquidity_one_coin(uint256,uint256,uint256)",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "targetContract",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "token", values?: undefined): string;
  encodeFunctionData(functionFragment: "token0", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "token0Mask",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "token1", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "token1Mask",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "token2", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "token2Mask",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "token3", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "token3Mask",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlying0",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlying0Mask",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlying1",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlying1Mask",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlying2",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlying2Mask",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlying3",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlying3Mask",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "use256", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "_gearboxAdapterType",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_gearboxAdapterVersion",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "add_diff_liquidity_one_coin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "add_liquidity_one_coin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "addressProvider",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "calc_add_one_coin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "creditManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exchange(int128,int128,uint256,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exchange(uint256,uint256,uint256,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exchange_diff",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exchange_diff_underlying",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exchange_underlying(uint256,uint256,uint256,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exchange_underlying(int128,int128,uint256,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lpTokenMask",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lp_token", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "metapoolBase",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "nCoins", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "remove_diff_liquidity_one_coin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "remove_liquidity_one_coin(uint256,int128,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "remove_liquidity_one_coin(uint256,uint256,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "targetContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token0", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token0Mask", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token1", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token1Mask", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token2", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token2Mask", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token3", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token3Mask", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "underlying0",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "underlying0Mask",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "underlying1",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "underlying1Mask",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "underlying2",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "underlying2Mask",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "underlying3",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "underlying3Mask",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "use256", data: BytesLike): Result;
}

export interface ICurveV1Adapter extends BaseContract {
  connect(runner?: ContractRunner | null): ICurveV1Adapter;
  waitForDeployment(): Promise<this>;

  interface: ICurveV1AdapterInterface;

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

  add_diff_liquidity_one_coin: TypedContractMethod<
    [leftoverAmount: BigNumberish, i: BigNumberish, rateMinRAY: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  add_liquidity_one_coin: TypedContractMethod<
    [amount: BigNumberish, i: BigNumberish, minAmount: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  addressProvider: TypedContractMethod<[], [string], "view">;

  calc_add_one_coin: TypedContractMethod<
    [amount: BigNumberish, i: BigNumberish],
    [bigint],
    "view"
  >;

  creditManager: TypedContractMethod<[], [string], "view">;

  "exchange(int128,int128,uint256,uint256)": TypedContractMethod<
    [i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  "exchange(uint256,uint256,uint256,uint256)": TypedContractMethod<
    [i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  exchange_diff: TypedContractMethod<
    [
      i: BigNumberish,
      j: BigNumberish,
      leftoverAmount: BigNumberish,
      rateMinRAY: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  exchange_diff_underlying: TypedContractMethod<
    [
      i: BigNumberish,
      j: BigNumberish,
      leftoverAmount: BigNumberish,
      rateMinRAY: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  "exchange_underlying(uint256,uint256,uint256,uint256)": TypedContractMethod<
    [i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  "exchange_underlying(int128,int128,uint256,uint256)": TypedContractMethod<
    [i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  lpTokenMask: TypedContractMethod<[], [bigint], "view">;

  lp_token: TypedContractMethod<[], [string], "view">;

  metapoolBase: TypedContractMethod<[], [string], "view">;

  nCoins: TypedContractMethod<[], [bigint], "view">;

  remove_diff_liquidity_one_coin: TypedContractMethod<
    [leftoverAmount: BigNumberish, i: BigNumberish, rateMinRAY: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  "remove_liquidity_one_coin(uint256,int128,uint256)": TypedContractMethod<
    [amount: BigNumberish, i: BigNumberish, minAmount: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  "remove_liquidity_one_coin(uint256,uint256,uint256)": TypedContractMethod<
    [amount: BigNumberish, i: BigNumberish, minAmount: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;

  targetContract: TypedContractMethod<[], [string], "view">;

  token: TypedContractMethod<[], [string], "view">;

  token0: TypedContractMethod<[], [string], "view">;

  token0Mask: TypedContractMethod<[], [bigint], "view">;

  token1: TypedContractMethod<[], [string], "view">;

  token1Mask: TypedContractMethod<[], [bigint], "view">;

  token2: TypedContractMethod<[], [string], "view">;

  token2Mask: TypedContractMethod<[], [bigint], "view">;

  token3: TypedContractMethod<[], [string], "view">;

  token3Mask: TypedContractMethod<[], [bigint], "view">;

  underlying0: TypedContractMethod<[], [string], "view">;

  underlying0Mask: TypedContractMethod<[], [bigint], "view">;

  underlying1: TypedContractMethod<[], [string], "view">;

  underlying1Mask: TypedContractMethod<[], [bigint], "view">;

  underlying2: TypedContractMethod<[], [string], "view">;

  underlying2Mask: TypedContractMethod<[], [bigint], "view">;

  underlying3: TypedContractMethod<[], [string], "view">;

  underlying3Mask: TypedContractMethod<[], [bigint], "view">;

  use256: TypedContractMethod<[], [boolean], "view">;

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
    nameOrSignature: "add_diff_liquidity_one_coin"
  ): TypedContractMethod<
    [leftoverAmount: BigNumberish, i: BigNumberish, rateMinRAY: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "add_liquidity_one_coin"
  ): TypedContractMethod<
    [amount: BigNumberish, i: BigNumberish, minAmount: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "addressProvider"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "calc_add_one_coin"
  ): TypedContractMethod<
    [amount: BigNumberish, i: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "creditManager"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "exchange(int128,int128,uint256,uint256)"
  ): TypedContractMethod<
    [i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "exchange(uint256,uint256,uint256,uint256)"
  ): TypedContractMethod<
    [i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "exchange_diff"
  ): TypedContractMethod<
    [
      i: BigNumberish,
      j: BigNumberish,
      leftoverAmount: BigNumberish,
      rateMinRAY: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "exchange_diff_underlying"
  ): TypedContractMethod<
    [
      i: BigNumberish,
      j: BigNumberish,
      leftoverAmount: BigNumberish,
      rateMinRAY: BigNumberish
    ],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "exchange_underlying(uint256,uint256,uint256,uint256)"
  ): TypedContractMethod<
    [i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "exchange_underlying(int128,int128,uint256,uint256)"
  ): TypedContractMethod<
    [i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "lpTokenMask"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "lp_token"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "metapoolBase"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "nCoins"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "remove_diff_liquidity_one_coin"
  ): TypedContractMethod<
    [leftoverAmount: BigNumberish, i: BigNumberish, rateMinRAY: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "remove_liquidity_one_coin(uint256,int128,uint256)"
  ): TypedContractMethod<
    [amount: BigNumberish, i: BigNumberish, minAmount: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "remove_liquidity_one_coin(uint256,uint256,uint256)"
  ): TypedContractMethod<
    [amount: BigNumberish, i: BigNumberish, minAmount: BigNumberish],
    [[bigint, bigint] & { tokensToEnable: bigint; tokensToDisable: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "targetContract"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "token"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "token0"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "token0Mask"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "token1"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "token1Mask"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "token2"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "token2Mask"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "token3"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "token3Mask"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "underlying0"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "underlying0Mask"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "underlying1"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "underlying1Mask"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "underlying2"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "underlying2Mask"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "underlying3"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "underlying3Mask"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "use256"
  ): TypedContractMethod<[], [boolean], "view">;

  filters: {};
}
