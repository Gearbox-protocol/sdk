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

export interface IConvexV1BoosterAdapterInterface extends utils.Interface {
  functions: {
    "_gearboxAdapterType()": FunctionFragment;
    "_gearboxAdapterVersion()": FunctionFragment;
    "addressProvider()": FunctionFragment;
    "creditManager()": FunctionFragment;
    "deposit(uint256,uint256,bool)": FunctionFragment;
    "depositAll(uint256,bool)": FunctionFragment;
    "pidToPhantomToken(uint256)": FunctionFragment;
    "targetContract()": FunctionFragment;
    "updateStakedPhantomTokensMap()": FunctionFragment;
    "withdraw(uint256,uint256)": FunctionFragment;
    "withdrawAll(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_gearboxAdapterType"
      | "_gearboxAdapterVersion"
      | "addressProvider"
      | "creditManager"
      | "deposit"
      | "depositAll"
      | "pidToPhantomToken"
      | "targetContract"
      | "updateStakedPhantomTokensMap"
      | "withdraw"
      | "withdrawAll"
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
  encodeFunctionData(
    functionFragment: "deposit",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<boolean>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "depositAll",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<boolean>]
  ): string;
  encodeFunctionData(
    functionFragment: "pidToPhantomToken",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "targetContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "updateStakedPhantomTokensMap",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawAll",
    values: [PromiseOrValue<BigNumberish>]
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
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "depositAll", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pidToPhantomToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "targetContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateStakedPhantomTokensMap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawAll",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IConvexV1BoosterAdapter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IConvexV1BoosterAdapterInterface;

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

    deposit(
      _pid: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      _stake: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    depositAll(
      _pid: PromiseOrValue<BigNumberish>,
      _stake: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    pidToPhantomToken(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    targetContract(overrides?: CallOverrides): Promise<[string]>;

    updateStakedPhantomTokensMap(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdraw(
      _pid: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawAll(
      _pid: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;

  _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;

  addressProvider(overrides?: CallOverrides): Promise<string>;

  creditManager(overrides?: CallOverrides): Promise<string>;

  deposit(
    _pid: PromiseOrValue<BigNumberish>,
    arg1: PromiseOrValue<BigNumberish>,
    _stake: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  depositAll(
    _pid: PromiseOrValue<BigNumberish>,
    _stake: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  pidToPhantomToken(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  targetContract(overrides?: CallOverrides): Promise<string>;

  updateStakedPhantomTokensMap(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdraw(
    _pid: PromiseOrValue<BigNumberish>,
    arg1: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawAll(
    _pid: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;

    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;

    addressProvider(overrides?: CallOverrides): Promise<string>;

    creditManager(overrides?: CallOverrides): Promise<string>;

    deposit(
      _pid: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      _stake: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        tokensToEnable: BigNumber;
        tokensToDisable: BigNumber;
      }
    >;

    depositAll(
      _pid: PromiseOrValue<BigNumberish>,
      _stake: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        tokensToEnable: BigNumber;
        tokensToDisable: BigNumber;
      }
    >;

    pidToPhantomToken(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    targetContract(overrides?: CallOverrides): Promise<string>;

    updateStakedPhantomTokensMap(overrides?: CallOverrides): Promise<void>;

    withdraw(
      _pid: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        tokensToEnable: BigNumber;
        tokensToDisable: BigNumber;
      }
    >;

    withdrawAll(
      _pid: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        tokensToEnable: BigNumber;
        tokensToDisable: BigNumber;
      }
    >;
  };

  filters: {};

  estimateGas: {
    _gearboxAdapterType(overrides?: CallOverrides): Promise<BigNumber>;

    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<BigNumber>;

    addressProvider(overrides?: CallOverrides): Promise<BigNumber>;

    creditManager(overrides?: CallOverrides): Promise<BigNumber>;

    deposit(
      _pid: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      _stake: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    depositAll(
      _pid: PromiseOrValue<BigNumberish>,
      _stake: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    pidToPhantomToken(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    targetContract(overrides?: CallOverrides): Promise<BigNumber>;

    updateStakedPhantomTokensMap(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdraw(
      _pid: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawAll(
      _pid: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
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

    deposit(
      _pid: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      _stake: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    depositAll(
      _pid: PromiseOrValue<BigNumberish>,
      _stake: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    pidToPhantomToken(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    targetContract(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updateStakedPhantomTokensMap(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdraw(
      _pid: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawAll(
      _pid: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}