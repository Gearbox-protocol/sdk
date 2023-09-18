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

export declare namespace DataTypes {
  export type ReserveConfigurationMapStruct = {
    data: PromiseOrValue<BigNumberish>;
  };

  export type ReserveConfigurationMapStructOutput = [BigNumber] & {
    data: BigNumber;
  };

  export type ReserveDataStruct = {
    configuration: DataTypes.ReserveConfigurationMapStruct;
    liquidityIndex: PromiseOrValue<BigNumberish>;
    variableBorrowIndex: PromiseOrValue<BigNumberish>;
    currentLiquidityRate: PromiseOrValue<BigNumberish>;
    currentVariableBorrowRate: PromiseOrValue<BigNumberish>;
    currentStableBorrowRate: PromiseOrValue<BigNumberish>;
    lastUpdateTimestamp: PromiseOrValue<BigNumberish>;
    aTokenAddress: PromiseOrValue<string>;
    stableDebtTokenAddress: PromiseOrValue<string>;
    variableDebtTokenAddress: PromiseOrValue<string>;
    interestRateStrategyAddress: PromiseOrValue<string>;
    id: PromiseOrValue<BigNumberish>;
  };

  export type ReserveDataStructOutput = [
    DataTypes.ReserveConfigurationMapStructOutput,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    number,
    string,
    string,
    string,
    string,
    number
  ] & {
    configuration: DataTypes.ReserveConfigurationMapStructOutput;
    liquidityIndex: BigNumber;
    variableBorrowIndex: BigNumber;
    currentLiquidityRate: BigNumber;
    currentVariableBorrowRate: BigNumber;
    currentStableBorrowRate: BigNumber;
    lastUpdateTimestamp: number;
    aTokenAddress: string;
    stableDebtTokenAddress: string;
    variableDebtTokenAddress: string;
    interestRateStrategyAddress: string;
    id: number;
  };
}

export interface ILendingPoolInterface extends utils.Interface {
  functions: {
    "deposit(address,uint256,address,uint16)": FunctionFragment;
    "getReserveData(address)": FunctionFragment;
    "getReserveNormalizedIncome(address)": FunctionFragment;
    "withdraw(address,uint256,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "deposit"
      | "getReserveData"
      | "getReserveNormalizedIncome"
      | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "deposit",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getReserveData",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getReserveNormalizedIncome",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getReserveData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getReserveNormalizedIncome",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {};
}

export interface ILendingPool extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ILendingPoolInterface;

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
    deposit(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      onBehalfOf: PromiseOrValue<string>,
      referralCode: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getReserveData(
      asset: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[DataTypes.ReserveDataStructOutput]>;

    getReserveNormalizedIncome(
      asset: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    withdraw(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  deposit(
    asset: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    onBehalfOf: PromiseOrValue<string>,
    referralCode: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getReserveData(
    asset: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<DataTypes.ReserveDataStructOutput>;

  getReserveNormalizedIncome(
    asset: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  withdraw(
    asset: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    to: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    deposit(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      onBehalfOf: PromiseOrValue<string>,
      referralCode: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    getReserveData(
      asset: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<DataTypes.ReserveDataStructOutput>;

    getReserveNormalizedIncome(
      asset: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    deposit(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      onBehalfOf: PromiseOrValue<string>,
      referralCode: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getReserveData(
      asset: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getReserveNormalizedIncome(
      asset: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    deposit(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      onBehalfOf: PromiseOrValue<string>,
      referralCode: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getReserveData(
      asset: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getReserveNormalizedIncome(
      asset: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdraw(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}