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

export interface ITokenDistributorInterface extends utils.Interface {
  functions: {
    "balanceOf(address)": FunctionFragment;
    "contributorVestingContracts(address)": FunctionFragment;
    "contributorsList()": FunctionFragment;
    "countContributors()": FunctionFragment;
    "distributeTokens(address,string,uint256,uint256,uint256,uint256,uint256)": FunctionFragment;
    "updateContributor(address)": FunctionFragment;
    "updateContributors()": FunctionFragment;
    "updateVotingCategoryMultiplier(string,uint16)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "balanceOf"
      | "contributorVestingContracts"
      | "contributorsList"
      | "countContributors"
      | "distributeTokens"
      | "updateContributor"
      | "updateContributors"
      | "updateVotingCategoryMultiplier"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(
    functionFragment: "contributorVestingContracts",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "contributorsList",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "countContributors",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "distributeTokens",
    values: [
      string,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "updateContributor",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "updateContributors",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "updateVotingCategoryMultiplier",
    values: [string, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "contributorVestingContracts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "contributorsList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "countContributors",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "distributeTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateContributor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateContributors",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateVotingCategoryMultiplier",
    data: BytesLike
  ): Result;

  events: {
    "NewDistrubtionController(address)": EventFragment;
    "NewVotingMultiplier(string,uint16)": EventFragment;
    "VestingContractAdded(address,address,uint256,string)": EventFragment;
    "VestingContractReceiverUpdated(address,address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "NewDistrubtionController"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewVotingMultiplier"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VestingContractAdded"): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "VestingContractReceiverUpdated"
  ): EventFragment;
}

export interface NewDistrubtionControllerEventObject {
  newController: string;
}
export type NewDistrubtionControllerEvent = TypedEvent<
  [string],
  NewDistrubtionControllerEventObject
>;

export type NewDistrubtionControllerEventFilter =
  TypedEventFilter<NewDistrubtionControllerEvent>;

export interface NewVotingMultiplierEventObject {
  category: string;
  multiplier: number;
}
export type NewVotingMultiplierEvent = TypedEvent<
  [string, number],
  NewVotingMultiplierEventObject
>;

export type NewVotingMultiplierEventFilter =
  TypedEventFilter<NewVotingMultiplierEvent>;

export interface VestingContractAddedEventObject {
  holder: string;
  vestingContract: string;
  amount: BigNumber;
  votingPowerCategory: string;
}
export type VestingContractAddedEvent = TypedEvent<
  [string, string, BigNumber, string],
  VestingContractAddedEventObject
>;

export type VestingContractAddedEventFilter =
  TypedEventFilter<VestingContractAddedEvent>;

export interface VestingContractReceiverUpdatedEventObject {
  vestingContract: string;
  prevReceiver: string;
  newReceiver: string;
}
export type VestingContractReceiverUpdatedEvent = TypedEvent<
  [string, string, string],
  VestingContractReceiverUpdatedEventObject
>;

export type VestingContractReceiverUpdatedEventFilter =
  TypedEventFilter<VestingContractReceiverUpdatedEvent>;

export interface ITokenDistributor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ITokenDistributorInterface;

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
    balanceOf(
      holder: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { vestedBalanceWeighted: BigNumber }>;

    contributorVestingContracts(
      contributor: string,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    contributorsList(overrides?: CallOverrides): Promise<[string[]]>;

    countContributors(overrides?: CallOverrides): Promise<[BigNumber]>;

    distributeTokens(
      recipient: string,
      votingCategory: string,
      cliffDuration: BigNumberish,
      cliffAmount: BigNumberish,
      vestingDuration: BigNumberish,
      vestingNumSteps: BigNumberish,
      vestingAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateContributor(
      contributor: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateContributors(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateVotingCategoryMultiplier(
      category: string,
      multiplier: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  balanceOf(holder: string, overrides?: CallOverrides): Promise<BigNumber>;

  contributorVestingContracts(
    contributor: string,
    overrides?: CallOverrides
  ): Promise<string[]>;

  contributorsList(overrides?: CallOverrides): Promise<string[]>;

  countContributors(overrides?: CallOverrides): Promise<BigNumber>;

  distributeTokens(
    recipient: string,
    votingCategory: string,
    cliffDuration: BigNumberish,
    cliffAmount: BigNumberish,
    vestingDuration: BigNumberish,
    vestingNumSteps: BigNumberish,
    vestingAmount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateContributor(
    contributor: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateContributors(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateVotingCategoryMultiplier(
    category: string,
    multiplier: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    balanceOf(holder: string, overrides?: CallOverrides): Promise<BigNumber>;

    contributorVestingContracts(
      contributor: string,
      overrides?: CallOverrides
    ): Promise<string[]>;

    contributorsList(overrides?: CallOverrides): Promise<string[]>;

    countContributors(overrides?: CallOverrides): Promise<BigNumber>;

    distributeTokens(
      recipient: string,
      votingCategory: string,
      cliffDuration: BigNumberish,
      cliffAmount: BigNumberish,
      vestingDuration: BigNumberish,
      vestingNumSteps: BigNumberish,
      vestingAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    updateContributor(
      contributor: string,
      overrides?: CallOverrides
    ): Promise<void>;

    updateContributors(overrides?: CallOverrides): Promise<void>;

    updateVotingCategoryMultiplier(
      category: string,
      multiplier: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "NewDistrubtionController(address)"(
      newController?: null
    ): NewDistrubtionControllerEventFilter;
    NewDistrubtionController(
      newController?: null
    ): NewDistrubtionControllerEventFilter;

    "NewVotingMultiplier(string,uint16)"(
      category?: string | null,
      multiplier?: null
    ): NewVotingMultiplierEventFilter;
    NewVotingMultiplier(
      category?: string | null,
      multiplier?: null
    ): NewVotingMultiplierEventFilter;

    "VestingContractAdded(address,address,uint256,string)"(
      holder?: string | null,
      vestingContract?: string | null,
      amount?: null,
      votingPowerCategory?: null
    ): VestingContractAddedEventFilter;
    VestingContractAdded(
      holder?: string | null,
      vestingContract?: string | null,
      amount?: null,
      votingPowerCategory?: null
    ): VestingContractAddedEventFilter;

    "VestingContractReceiverUpdated(address,address,address)"(
      vestingContract?: string | null,
      prevReceiver?: string | null,
      newReceiver?: string | null
    ): VestingContractReceiverUpdatedEventFilter;
    VestingContractReceiverUpdated(
      vestingContract?: string | null,
      prevReceiver?: string | null,
      newReceiver?: string | null
    ): VestingContractReceiverUpdatedEventFilter;
  };

  estimateGas: {
    balanceOf(holder: string, overrides?: CallOverrides): Promise<BigNumber>;

    contributorVestingContracts(
      contributor: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    contributorsList(overrides?: CallOverrides): Promise<BigNumber>;

    countContributors(overrides?: CallOverrides): Promise<BigNumber>;

    distributeTokens(
      recipient: string,
      votingCategory: string,
      cliffDuration: BigNumberish,
      cliffAmount: BigNumberish,
      vestingDuration: BigNumberish,
      vestingNumSteps: BigNumberish,
      vestingAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateContributor(
      contributor: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateContributors(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateVotingCategoryMultiplier(
      category: string,
      multiplier: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceOf(
      holder: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    contributorVestingContracts(
      contributor: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    contributorsList(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    countContributors(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    distributeTokens(
      recipient: string,
      votingCategory: string,
      cliffDuration: BigNumberish,
      cliffAmount: BigNumberish,
      vestingDuration: BigNumberish,
      vestingNumSteps: BigNumberish,
      vestingAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateContributor(
      contributor: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateContributors(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateVotingCategoryMultiplier(
      category: string,
      multiplier: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
