/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../common";

export interface ITokenDistributorEventsInterface extends utils.Interface {
  functions: {};

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

export interface ITokenDistributorEvents extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ITokenDistributorEventsInterface;

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

  functions: {};

  callStatic: {};

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

  estimateGas: {};

  populateTransaction: {};
}
