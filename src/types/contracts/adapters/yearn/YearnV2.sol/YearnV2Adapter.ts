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
} from "../../../../common";

export interface YearnV2AdapterInterface extends utils.Interface {
  functions: {
    "_gearboxAdapterType()": FunctionFragment;
    "_gearboxAdapterVersion()": FunctionFragment;
    "allowance(address,address)": FunctionFragment;
    "approve(address,uint256)": FunctionFragment;
    "balanceOf(address)": FunctionFragment;
    "creditFacade()": FunctionFragment;
    "creditManager()": FunctionFragment;
    "decimals()": FunctionFragment;
    "deposit(uint256,address)": FunctionFragment;
    "deposit(uint256)": FunctionFragment;
    "deposit()": FunctionFragment;
    "name()": FunctionFragment;
    "pricePerShare()": FunctionFragment;
    "symbol()": FunctionFragment;
    "targetContract()": FunctionFragment;
    "token()": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "transfer(address,uint256)": FunctionFragment;
    "transferFrom(address,address,uint256)": FunctionFragment;
    "withdraw(uint256,address)": FunctionFragment;
    "withdraw(uint256)": FunctionFragment;
    "withdraw()": FunctionFragment;
    "withdraw(uint256,address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_gearboxAdapterType"
      | "_gearboxAdapterVersion"
      | "allowance"
      | "approve"
      | "balanceOf"
      | "creditFacade"
      | "creditManager"
      | "decimals"
      | "deposit(uint256,address)"
      | "deposit(uint256)"
      | "deposit()"
      | "name"
      | "pricePerShare"
      | "symbol"
      | "targetContract"
      | "token"
      | "totalSupply"
      | "transfer"
      | "transferFrom"
      | "withdraw(uint256,address)"
      | "withdraw(uint256)"
      | "withdraw()"
      | "withdraw(uint256,address,uint256)",
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "_gearboxAdapterType",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "_gearboxAdapterVersion",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "allowance",
    values: [string, string],
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [string, BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(
    functionFragment: "creditFacade",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "creditManager",
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "deposit(uint256,address)",
    values: [BigNumberish, string],
  ): string;
  encodeFunctionData(
    functionFragment: "deposit(uint256)",
    values: [BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: "deposit()", values?: undefined): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pricePerShare",
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "targetContract",
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: "token", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [string, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [string, string, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw(uint256,address)",
    values: [BigNumberish, string],
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw(uint256)",
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw()",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw(uint256,address,uint256)",
    values: [BigNumberish, string, BigNumberish],
  ): string;

  decodeFunctionResult(
    functionFragment: "_gearboxAdapterType",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "_gearboxAdapterVersion",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "creditFacade",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "creditManager",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "deposit(uint256,address)",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "deposit(uint256)",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "deposit()", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pricePerShare",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "targetContract",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdraw(uint256,address)",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdraw(uint256)",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw()", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdraw(uint256,address,uint256)",
    data: BytesLike,
  ): Result;

  events: {
    "Approval(address,address,uint256)": EventFragment;
    "Transfer(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
}

export interface ApprovalEventObject {
  owner: string;
  spender: string;
  value: BigNumber;
}
export type ApprovalEvent = TypedEvent<
  [string, string, BigNumber],
  ApprovalEventObject
>;

export type ApprovalEventFilter = TypedEventFilter<ApprovalEvent>;

export interface TransferEventObject {
  from: string;
  to: string;
  value: BigNumber;
}
export type TransferEvent = TypedEvent<
  [string, string, BigNumber],
  TransferEventObject
>;

export type TransferEventFilter = TypedEventFilter<TransferEvent>;

export interface YearnV2Adapter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: YearnV2AdapterInterface;

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
    _gearboxAdapterType(overrides?: CallOverrides): Promise<[number]>;

    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<[number]>;

    allowance(
      owner: string,
      spender: string,
      overrides?: CallOverrides,
    ): Promise<[BigNumber]>;

    approve(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<[boolean]>;

    balanceOf(account: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    creditFacade(overrides?: CallOverrides): Promise<[string]>;

    creditManager(overrides?: CallOverrides): Promise<[string]>;

    decimals(overrides?: CallOverrides): Promise<[number]>;

    "deposit(uint256,address)"(
      amount: BigNumberish,
      arg1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "deposit(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "deposit()"(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    name(overrides?: CallOverrides): Promise<[string]>;

    pricePerShare(overrides?: CallOverrides): Promise<[BigNumber]>;

    symbol(overrides?: CallOverrides): Promise<[string]>;

    targetContract(overrides?: CallOverrides): Promise<[string]>;

    token(overrides?: CallOverrides): Promise<[string]>;

    totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    transfer(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<[boolean]>;

    transferFrom(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<[boolean]>;

    "withdraw(uint256,address)"(
      maxShares: BigNumberish,
      arg1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "withdraw(uint256)"(
      maxShares: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "withdraw()"(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "withdraw(uint256,address,uint256)"(
      maxShares: BigNumberish,
      arg1: string,
      maxLoss: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;
  };

  _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;

  _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;

  allowance(
    owner: string,
    spender: string,
    overrides?: CallOverrides,
  ): Promise<BigNumber>;

  approve(
    arg0: string,
    arg1: BigNumberish,
    overrides?: CallOverrides,
  ): Promise<boolean>;

  balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

  creditFacade(overrides?: CallOverrides): Promise<string>;

  creditManager(overrides?: CallOverrides): Promise<string>;

  decimals(overrides?: CallOverrides): Promise<number>;

  "deposit(uint256,address)"(
    amount: BigNumberish,
    arg1: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "deposit(uint256)"(
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "deposit()"(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  name(overrides?: CallOverrides): Promise<string>;

  pricePerShare(overrides?: CallOverrides): Promise<BigNumber>;

  symbol(overrides?: CallOverrides): Promise<string>;

  targetContract(overrides?: CallOverrides): Promise<string>;

  token(overrides?: CallOverrides): Promise<string>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  transfer(
    arg0: string,
    arg1: BigNumberish,
    overrides?: CallOverrides,
  ): Promise<boolean>;

  transferFrom(
    arg0: string,
    arg1: string,
    arg2: BigNumberish,
    overrides?: CallOverrides,
  ): Promise<boolean>;

  "withdraw(uint256,address)"(
    maxShares: BigNumberish,
    arg1: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "withdraw(uint256)"(
    maxShares: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "withdraw()"(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "withdraw(uint256,address,uint256)"(
    maxShares: BigNumberish,
    arg1: string,
    maxLoss: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  callStatic: {
    _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;

    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;

    allowance(
      owner: string,
      spender: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    approve(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<boolean>;

    balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    creditFacade(overrides?: CallOverrides): Promise<string>;

    creditManager(overrides?: CallOverrides): Promise<string>;

    decimals(overrides?: CallOverrides): Promise<number>;

    "deposit(uint256,address)"(
      amount: BigNumberish,
      arg1: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    "deposit(uint256)"(
      amount: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    "deposit()"(overrides?: CallOverrides): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<string>;

    pricePerShare(overrides?: CallOverrides): Promise<BigNumber>;

    symbol(overrides?: CallOverrides): Promise<string>;

    targetContract(overrides?: CallOverrides): Promise<string>;

    token(overrides?: CallOverrides): Promise<string>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<boolean>;

    transferFrom(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<boolean>;

    "withdraw(uint256,address)"(
      maxShares: BigNumberish,
      arg1: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    "withdraw(uint256)"(
      maxShares: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    "withdraw()"(overrides?: CallOverrides): Promise<BigNumber>;

    "withdraw(uint256,address,uint256)"(
      maxShares: BigNumberish,
      arg1: string,
      maxLoss: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;
  };

  filters: {
    "Approval(address,address,uint256)"(
      owner?: string | null,
      spender?: string | null,
      value?: null,
    ): ApprovalEventFilter;
    Approval(
      owner?: string | null,
      spender?: string | null,
      value?: null,
    ): ApprovalEventFilter;

    "Transfer(address,address,uint256)"(
      from?: string | null,
      to?: string | null,
      value?: null,
    ): TransferEventFilter;
    Transfer(
      from?: string | null,
      to?: string | null,
      value?: null,
    ): TransferEventFilter;
  };

  estimateGas: {
    _gearboxAdapterType(overrides?: CallOverrides): Promise<BigNumber>;

    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<BigNumber>;

    allowance(
      owner: string,
      spender: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    approve(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    creditFacade(overrides?: CallOverrides): Promise<BigNumber>;

    creditManager(overrides?: CallOverrides): Promise<BigNumber>;

    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    "deposit(uint256,address)"(
      amount: BigNumberish,
      arg1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "deposit(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "deposit()"(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    pricePerShare(overrides?: CallOverrides): Promise<BigNumber>;

    symbol(overrides?: CallOverrides): Promise<BigNumber>;

    targetContract(overrides?: CallOverrides): Promise<BigNumber>;

    token(overrides?: CallOverrides): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    transferFrom(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    "withdraw(uint256,address)"(
      maxShares: BigNumberish,
      arg1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "withdraw(uint256)"(
      maxShares: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "withdraw()"(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "withdraw(uint256,address,uint256)"(
      maxShares: BigNumberish,
      arg1: string,
      maxLoss: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _gearboxAdapterType(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    _gearboxAdapterVersion(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    allowance(
      owner: string,
      spender: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    approve(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    balanceOf(
      account: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    creditFacade(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    creditManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "deposit(uint256,address)"(
      amount: BigNumberish,
      arg1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "deposit(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "deposit()"(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pricePerShare(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    targetContract(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    token(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transfer(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    transferFrom(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    "withdraw(uint256,address)"(
      maxShares: BigNumberish,
      arg1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "withdraw(uint256)"(
      maxShares: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "withdraw()"(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "withdraw(uint256,address,uint256)"(
      maxShares: BigNumberish,
      arg1: string,
      maxLoss: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;
  };
}
