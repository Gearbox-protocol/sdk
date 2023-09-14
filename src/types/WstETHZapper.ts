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

export interface WstETHZapperInterface extends utils.Interface {
  functions: {
    "deposit(uint256,address)": FunctionFragment;
    "depositWithUnderlying(uint256,address,uint16)": FunctionFragment;
    "pool()": FunctionFragment;
    "previewDeposit(uint256)": FunctionFragment;
    "previewRedeem(uint256)": FunctionFragment;
    "redeem(uint256,address,address)": FunctionFragment;
    "unwrappedToken()": FunctionFragment;
    "wrappedToken()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "deposit"
      | "depositWithUnderlying"
      | "pool"
      | "previewDeposit"
      | "previewRedeem"
      | "redeem"
      | "unwrappedToken"
      | "wrappedToken"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "deposit",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "depositWithUnderlying",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(functionFragment: "pool", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "previewDeposit",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "previewRedeem",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "redeem",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "unwrappedToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "wrappedToken",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "depositWithUnderlying",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "pool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "previewDeposit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "previewRedeem",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "unwrappedToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "wrappedToken",
    data: BytesLike
  ): Result;

  events: {};
}

export interface WstETHZapper extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: WstETHZapperInterface;

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
      amount: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    depositWithUnderlying(
      amount: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      referralCode: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    pool(overrides?: CallOverrides): Promise<[string]>;

    previewDeposit(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { shares: BigNumber }>;

    previewRedeem(
      shares: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { amount: BigNumber }>;

    redeem(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    unwrappedToken(overrides?: CallOverrides): Promise<[string]>;

    wrappedToken(overrides?: CallOverrides): Promise<[string]>;
  };

  deposit(
    amount: PromiseOrValue<BigNumberish>,
    receiver: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  depositWithUnderlying(
    amount: PromiseOrValue<BigNumberish>,
    receiver: PromiseOrValue<string>,
    referralCode: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  pool(overrides?: CallOverrides): Promise<string>;

  previewDeposit(
    amount: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  previewRedeem(
    shares: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  redeem(
    shares: PromiseOrValue<BigNumberish>,
    receiver: PromiseOrValue<string>,
    owner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  unwrappedToken(overrides?: CallOverrides): Promise<string>;

  wrappedToken(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    deposit(
      amount: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    depositWithUnderlying(
      amount: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      referralCode: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    pool(overrides?: CallOverrides): Promise<string>;

    previewDeposit(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    previewRedeem(
      shares: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    redeem(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    unwrappedToken(overrides?: CallOverrides): Promise<string>;

    wrappedToken(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    deposit(
      amount: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    depositWithUnderlying(
      amount: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      referralCode: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    pool(overrides?: CallOverrides): Promise<BigNumber>;

    previewDeposit(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    previewRedeem(
      shares: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    redeem(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    unwrappedToken(overrides?: CallOverrides): Promise<BigNumber>;

    wrappedToken(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    deposit(
      amount: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    depositWithUnderlying(
      amount: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      referralCode: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    pool(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    previewDeposit(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    previewRedeem(
      shares: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    redeem(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    unwrappedToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    wrappedToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
