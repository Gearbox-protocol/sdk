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
  PromiseOrValue,
} from "../common";

export interface IAddressProviderV3Interface extends utils.Interface {
  functions: {
    "addresses(bytes32,uint256)": FunctionFragment;
    "getAddressOrRevert(bytes32,uint256)": FunctionFragment;
    "setAddress(bytes32,address,bool)": FunctionFragment;
    "version()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addresses"
      | "getAddressOrRevert"
      | "setAddress"
      | "version",
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addresses",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(
    functionFragment: "getAddressOrRevert",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(
    functionFragment: "setAddress",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
    ],
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(functionFragment: "addresses", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getAddressOrRevert",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "setAddress", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;

  events: {
    "SetAddress(bytes32,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "SetAddress"): EventFragment;
}

export interface SetAddressEventObject {
  key: string;
  value: string;
  version: BigNumber;
}
export type SetAddressEvent = TypedEvent<
  [string, string, BigNumber],
  SetAddressEventObject
>;

export type SetAddressEventFilter = TypedEventFilter<SetAddressEvent>;

export interface IAddressProviderV3 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IAddressProviderV3Interface;

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
    addresses(
      key: PromiseOrValue<BytesLike>,
      _version: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<[string]>;

    getAddressOrRevert(
      key: PromiseOrValue<BytesLike>,
      _version: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<[string] & { result: string }>;

    setAddress(
      key: PromiseOrValue<BytesLike>,
      value: PromiseOrValue<string>,
      saveVersion: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    version(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  addresses(
    key: PromiseOrValue<BytesLike>,
    _version: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<string>;

  getAddressOrRevert(
    key: PromiseOrValue<BytesLike>,
    _version: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<string>;

  setAddress(
    key: PromiseOrValue<BytesLike>,
    value: PromiseOrValue<string>,
    saveVersion: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  version(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    addresses(
      key: PromiseOrValue<BytesLike>,
      _version: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<string>;

    getAddressOrRevert(
      key: PromiseOrValue<BytesLike>,
      _version: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<string>;

    setAddress(
      key: PromiseOrValue<BytesLike>,
      value: PromiseOrValue<string>,
      saveVersion: PromiseOrValue<boolean>,
      overrides?: CallOverrides,
    ): Promise<void>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    "SetAddress(bytes32,address,uint256)"(
      key?: PromiseOrValue<BytesLike> | null,
      value?: PromiseOrValue<string> | null,
      version?: PromiseOrValue<BigNumberish> | null,
    ): SetAddressEventFilter;
    SetAddress(
      key?: PromiseOrValue<BytesLike> | null,
      value?: PromiseOrValue<string> | null,
      version?: PromiseOrValue<BigNumberish> | null,
    ): SetAddressEventFilter;
  };

  estimateGas: {
    addresses(
      key: PromiseOrValue<BytesLike>,
      _version: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getAddressOrRevert(
      key: PromiseOrValue<BytesLike>,
      _version: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    setAddress(
      key: PromiseOrValue<BytesLike>,
      value: PromiseOrValue<string>,
      saveVersion: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    addresses(
      key: PromiseOrValue<BytesLike>,
      _version: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getAddressOrRevert(
      key: PromiseOrValue<BytesLike>,
      _version: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    setAddress(
      key: PromiseOrValue<BytesLike>,
      value: PromiseOrValue<string>,
      saveVersion: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}