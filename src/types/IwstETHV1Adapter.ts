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
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export interface IwstETHV1AdapterInterface extends utils.Interface {
  functions: {
    "_gearboxAdapterType()": FunctionFragment;
    "_gearboxAdapterVersion()": FunctionFragment;
    "addressProvider()": FunctionFragment;
    "creditManager()": FunctionFragment;
    "stETH()": FunctionFragment;
    "stETHTokenMask()": FunctionFragment;
    "targetContract()": FunctionFragment;
    "unwrap(uint256)": FunctionFragment;
    "unwrapAll()": FunctionFragment;
    "wrap(uint256)": FunctionFragment;
    "wrapAll()": FunctionFragment;
    "wstETHTokenMask()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_gearboxAdapterType"
      | "_gearboxAdapterVersion"
      | "addressProvider"
      | "creditManager"
      | "stETH"
      | "stETHTokenMask"
      | "targetContract"
      | "unwrap"
      | "unwrapAll"
      | "wrap"
      | "wrapAll"
      | "wstETHTokenMask"
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
    functionFragment: "addressProvider",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "creditManager",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "stETH", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "stETHTokenMask",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "targetContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "unwrap",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "unwrapAll", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "wrap",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "wrapAll", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "wstETHTokenMask",
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
  decodeFunctionResult(
    functionFragment: "creditManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "stETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stETHTokenMask",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "targetContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unwrap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "unwrapAll", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "wrap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "wrapAll", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "wstETHTokenMask",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IwstETHV1Adapter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IwstETHV1AdapterInterface;

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
    _gearboxAdapterType(overrides?: CallOverrides): Promise<[number]>;

    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<[number]>;

    addressProvider(overrides?: CallOverrides): Promise<[string]>;

    creditManager(overrides?: CallOverrides): Promise<[string]>;

    stETH(overrides?: CallOverrides): Promise<[string]>;

    stETHTokenMask(overrides?: CallOverrides): Promise<[BigNumber]>;

    targetContract(overrides?: CallOverrides): Promise<[string]>;

    unwrap(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    unwrapAll(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    wrap(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    wrapAll(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    wstETHTokenMask(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;

  _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;

  addressProvider(overrides?: CallOverrides): Promise<string>;

  creditManager(overrides?: CallOverrides): Promise<string>;

  stETH(overrides?: CallOverrides): Promise<string>;

  stETHTokenMask(overrides?: CallOverrides): Promise<BigNumber>;

  targetContract(overrides?: CallOverrides): Promise<string>;

  unwrap(
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  unwrapAll(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  wrap(
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  wrapAll(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  wstETHTokenMask(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;

    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;

    addressProvider(overrides?: CallOverrides): Promise<string>;

    creditManager(overrides?: CallOverrides): Promise<string>;

    stETH(overrides?: CallOverrides): Promise<string>;

    stETHTokenMask(overrides?: CallOverrides): Promise<BigNumber>;

    targetContract(overrides?: CallOverrides): Promise<string>;

    unwrap(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        tokensToEnable: BigNumber;
        tokensToDisable: BigNumber;
      }
    >;

    unwrapAll(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        tokensToEnable: BigNumber;
        tokensToDisable: BigNumber;
      }
    >;

    wrap(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        tokensToEnable: BigNumber;
        tokensToDisable: BigNumber;
      }
    >;

    wrapAll(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        tokensToEnable: BigNumber;
        tokensToDisable: BigNumber;
      }
    >;

    wstETHTokenMask(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    _gearboxAdapterType(overrides?: CallOverrides): Promise<BigNumber>;

    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<BigNumber>;

    addressProvider(overrides?: CallOverrides): Promise<BigNumber>;

    creditManager(overrides?: CallOverrides): Promise<BigNumber>;

    stETH(overrides?: CallOverrides): Promise<BigNumber>;

    stETHTokenMask(overrides?: CallOverrides): Promise<BigNumber>;

    targetContract(overrides?: CallOverrides): Promise<BigNumber>;

    unwrap(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    unwrapAll(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    wrap(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    wrapAll(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    wstETHTokenMask(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    _gearboxAdapterType(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _gearboxAdapterVersion(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    addressProvider(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    creditManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    stETH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    stETHTokenMask(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    targetContract(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    unwrap(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    unwrapAll(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    wrap(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    wrapAll(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    wstETHTokenMask(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}