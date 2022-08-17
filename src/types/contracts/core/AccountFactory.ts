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
} from "../../common";

export interface AccountFactoryInterface extends utils.Interface {
  functions: {
    "_acl()": FunctionFragment;
    "_contractsRegister()": FunctionFragment;
    "addCreditAccount()": FunctionFragment;
    "cancelAllowance(address,address,address)": FunctionFragment;
    "countCreditAccounts()": FunctionFragment;
    "countCreditAccountsInStock()": FunctionFragment;
    "creditAccounts(uint256)": FunctionFragment;
    "getNext(address)": FunctionFragment;
    "head()": FunctionFragment;
    "isCreditAccount(address)": FunctionFragment;
    "masterCreditAccount()": FunctionFragment;
    "pause()": FunctionFragment;
    "paused()": FunctionFragment;
    "returnCreditAccount(address)": FunctionFragment;
    "tail()": FunctionFragment;
    "takeCreditAccount(uint256,uint256)": FunctionFragment;
    "takeOut(address,address,address)": FunctionFragment;
    "unpause()": FunctionFragment;
    "version()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_acl"
      | "_contractsRegister"
      | "addCreditAccount"
      | "cancelAllowance"
      | "countCreditAccounts"
      | "countCreditAccountsInStock"
      | "creditAccounts"
      | "getNext"
      | "head"
      | "isCreditAccount"
      | "masterCreditAccount"
      | "pause"
      | "paused"
      | "returnCreditAccount"
      | "tail"
      | "takeCreditAccount"
      | "takeOut"
      | "unpause"
      | "version",
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "_acl", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "_contractsRegister",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "addCreditAccount",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "cancelAllowance",
    values: [string, string, string],
  ): string;
  encodeFunctionData(
    functionFragment: "countCreditAccounts",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "countCreditAccountsInStock",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "creditAccounts",
    values: [BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: "getNext", values: [string]): string;
  encodeFunctionData(functionFragment: "head", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "isCreditAccount",
    values: [string],
  ): string;
  encodeFunctionData(
    functionFragment: "masterCreditAccount",
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "returnCreditAccount",
    values: [string],
  ): string;
  encodeFunctionData(functionFragment: "tail", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "takeCreditAccount",
    values: [BigNumberish, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: "takeOut",
    values: [string, string, string],
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(functionFragment: "_acl", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "_contractsRegister",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "addCreditAccount",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "cancelAllowance",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "countCreditAccounts",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "countCreditAccountsInStock",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "creditAccounts",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "getNext", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "head", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isCreditAccount",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "masterCreditAccount",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "returnCreditAccount",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "tail", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "takeCreditAccount",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "takeOut", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;

  events: {
    "AccountMinerChanged(address)": EventFragment;
    "InitializeCreditAccount(address,address)": EventFragment;
    "NewCreditAccount(address)": EventFragment;
    "Paused(address)": EventFragment;
    "ReturnCreditAccount(address)": EventFragment;
    "TakeForever(address,address)": EventFragment;
    "Unpaused(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AccountMinerChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "InitializeCreditAccount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewCreditAccount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ReturnCreditAccount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TakeForever"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
}

export interface AccountMinerChangedEventObject {
  miner: string;
}
export type AccountMinerChangedEvent = TypedEvent<
  [string],
  AccountMinerChangedEventObject
>;

export type AccountMinerChangedEventFilter =
  TypedEventFilter<AccountMinerChangedEvent>;

export interface InitializeCreditAccountEventObject {
  account: string;
  creditManager: string;
}
export type InitializeCreditAccountEvent = TypedEvent<
  [string, string],
  InitializeCreditAccountEventObject
>;

export type InitializeCreditAccountEventFilter =
  TypedEventFilter<InitializeCreditAccountEvent>;

export interface NewCreditAccountEventObject {
  account: string;
}
export type NewCreditAccountEvent = TypedEvent<
  [string],
  NewCreditAccountEventObject
>;

export type NewCreditAccountEventFilter =
  TypedEventFilter<NewCreditAccountEvent>;

export interface PausedEventObject {
  account: string;
}
export type PausedEvent = TypedEvent<[string], PausedEventObject>;

export type PausedEventFilter = TypedEventFilter<PausedEvent>;

export interface ReturnCreditAccountEventObject {
  account: string;
}
export type ReturnCreditAccountEvent = TypedEvent<
  [string],
  ReturnCreditAccountEventObject
>;

export type ReturnCreditAccountEventFilter =
  TypedEventFilter<ReturnCreditAccountEvent>;

export interface TakeForeverEventObject {
  creditAccount: string;
  to: string;
}
export type TakeForeverEvent = TypedEvent<
  [string, string],
  TakeForeverEventObject
>;

export type TakeForeverEventFilter = TypedEventFilter<TakeForeverEvent>;

export interface UnpausedEventObject {
  account: string;
}
export type UnpausedEvent = TypedEvent<[string], UnpausedEventObject>;

export type UnpausedEventFilter = TypedEventFilter<UnpausedEvent>;

export interface AccountFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AccountFactoryInterface;

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
    _acl(overrides?: CallOverrides): Promise<[string]>;

    _contractsRegister(overrides?: CallOverrides): Promise<[string]>;

    addCreditAccount(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    cancelAllowance(
      account: string,
      token: string,
      targetContract: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    countCreditAccounts(overrides?: CallOverrides): Promise<[BigNumber]>;

    countCreditAccountsInStock(overrides?: CallOverrides): Promise<[BigNumber]>;

    creditAccounts(
      id: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<[string]>;

    getNext(
      creditAccount: string,
      overrides?: CallOverrides,
    ): Promise<[string]>;

    head(overrides?: CallOverrides): Promise<[string]>;

    isCreditAccount(
      addr: string,
      overrides?: CallOverrides,
    ): Promise<[boolean]>;

    masterCreditAccount(overrides?: CallOverrides): Promise<[string]>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    paused(overrides?: CallOverrides): Promise<[boolean]>;

    returnCreditAccount(
      usedAccount: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    tail(overrides?: CallOverrides): Promise<[string]>;

    takeCreditAccount(
      _borrowedAmount: BigNumberish,
      _cumulativeIndexAtOpen: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    takeOut(
      prev: string,
      creditAccount: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    version(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  _acl(overrides?: CallOverrides): Promise<string>;

  _contractsRegister(overrides?: CallOverrides): Promise<string>;

  addCreditAccount(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  cancelAllowance(
    account: string,
    token: string,
    targetContract: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  countCreditAccounts(overrides?: CallOverrides): Promise<BigNumber>;

  countCreditAccountsInStock(overrides?: CallOverrides): Promise<BigNumber>;

  creditAccounts(id: BigNumberish, overrides?: CallOverrides): Promise<string>;

  getNext(creditAccount: string, overrides?: CallOverrides): Promise<string>;

  head(overrides?: CallOverrides): Promise<string>;

  isCreditAccount(addr: string, overrides?: CallOverrides): Promise<boolean>;

  masterCreditAccount(overrides?: CallOverrides): Promise<string>;

  pause(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  paused(overrides?: CallOverrides): Promise<boolean>;

  returnCreditAccount(
    usedAccount: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  tail(overrides?: CallOverrides): Promise<string>;

  takeCreditAccount(
    _borrowedAmount: BigNumberish,
    _cumulativeIndexAtOpen: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  takeOut(
    prev: string,
    creditAccount: string,
    to: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  unpause(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  version(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    _acl(overrides?: CallOverrides): Promise<string>;

    _contractsRegister(overrides?: CallOverrides): Promise<string>;

    addCreditAccount(overrides?: CallOverrides): Promise<void>;

    cancelAllowance(
      account: string,
      token: string,
      targetContract: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    countCreditAccounts(overrides?: CallOverrides): Promise<BigNumber>;

    countCreditAccountsInStock(overrides?: CallOverrides): Promise<BigNumber>;

    creditAccounts(
      id: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<string>;

    getNext(creditAccount: string, overrides?: CallOverrides): Promise<string>;

    head(overrides?: CallOverrides): Promise<string>;

    isCreditAccount(addr: string, overrides?: CallOverrides): Promise<boolean>;

    masterCreditAccount(overrides?: CallOverrides): Promise<string>;

    pause(overrides?: CallOverrides): Promise<void>;

    paused(overrides?: CallOverrides): Promise<boolean>;

    returnCreditAccount(
      usedAccount: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    tail(overrides?: CallOverrides): Promise<string>;

    takeCreditAccount(
      _borrowedAmount: BigNumberish,
      _cumulativeIndexAtOpen: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<string>;

    takeOut(
      prev: string,
      creditAccount: string,
      to: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    unpause(overrides?: CallOverrides): Promise<void>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    "AccountMinerChanged(address)"(
      miner?: string | null,
    ): AccountMinerChangedEventFilter;
    AccountMinerChanged(miner?: string | null): AccountMinerChangedEventFilter;

    "InitializeCreditAccount(address,address)"(
      account?: string | null,
      creditManager?: string | null,
    ): InitializeCreditAccountEventFilter;
    InitializeCreditAccount(
      account?: string | null,
      creditManager?: string | null,
    ): InitializeCreditAccountEventFilter;

    "NewCreditAccount(address)"(
      account?: string | null,
    ): NewCreditAccountEventFilter;
    NewCreditAccount(account?: string | null): NewCreditAccountEventFilter;

    "Paused(address)"(account?: null): PausedEventFilter;
    Paused(account?: null): PausedEventFilter;

    "ReturnCreditAccount(address)"(
      account?: string | null,
    ): ReturnCreditAccountEventFilter;
    ReturnCreditAccount(
      account?: string | null,
    ): ReturnCreditAccountEventFilter;

    "TakeForever(address,address)"(
      creditAccount?: string | null,
      to?: string | null,
    ): TakeForeverEventFilter;
    TakeForever(
      creditAccount?: string | null,
      to?: string | null,
    ): TakeForeverEventFilter;

    "Unpaused(address)"(account?: null): UnpausedEventFilter;
    Unpaused(account?: null): UnpausedEventFilter;
  };

  estimateGas: {
    _acl(overrides?: CallOverrides): Promise<BigNumber>;

    _contractsRegister(overrides?: CallOverrides): Promise<BigNumber>;

    addCreditAccount(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    cancelAllowance(
      account: string,
      token: string,
      targetContract: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    countCreditAccounts(overrides?: CallOverrides): Promise<BigNumber>;

    countCreditAccountsInStock(overrides?: CallOverrides): Promise<BigNumber>;

    creditAccounts(
      id: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getNext(
      creditAccount: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    head(overrides?: CallOverrides): Promise<BigNumber>;

    isCreditAccount(
      addr: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    masterCreditAccount(overrides?: CallOverrides): Promise<BigNumber>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    paused(overrides?: CallOverrides): Promise<BigNumber>;

    returnCreditAccount(
      usedAccount: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    tail(overrides?: CallOverrides): Promise<BigNumber>;

    takeCreditAccount(
      _borrowedAmount: BigNumberish,
      _cumulativeIndexAtOpen: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    takeOut(
      prev: string,
      creditAccount: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    _acl(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _contractsRegister(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    addCreditAccount(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    cancelAllowance(
      account: string,
      token: string,
      targetContract: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    countCreditAccounts(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    countCreditAccountsInStock(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    creditAccounts(
      id: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getNext(
      creditAccount: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    head(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isCreditAccount(
      addr: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    masterCreditAccount(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    returnCreditAccount(
      usedAccount: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    tail(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    takeCreditAccount(
      _borrowedAmount: BigNumberish,
      _cumulativeIndexAtOpen: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    takeOut(
      prev: string,
      creditAccount: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
