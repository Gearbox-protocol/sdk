/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  FunctionFragment,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
} from "../common";

export interface IContractsRegisterEventsInterface extends Interface {
  getEvent(
    nameOrSignatureOrTopic: "NewCreditManagerAdded" | "NewPoolAdded"
  ): EventFragment;
}

export namespace NewCreditManagerAddedEvent {
  export type InputTuple = [creditManager: AddressLike];
  export type OutputTuple = [creditManager: string];
  export interface OutputObject {
    creditManager: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace NewPoolAddedEvent {
  export type InputTuple = [pool: AddressLike];
  export type OutputTuple = [pool: string];
  export interface OutputObject {
    pool: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IContractsRegisterEvents extends BaseContract {
  connect(runner?: ContractRunner | null): IContractsRegisterEvents;
  waitForDeployment(): Promise<this>;

  interface: IContractsRegisterEventsInterface;

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

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getEvent(
    key: "NewCreditManagerAdded"
  ): TypedContractEvent<
    NewCreditManagerAddedEvent.InputTuple,
    NewCreditManagerAddedEvent.OutputTuple,
    NewCreditManagerAddedEvent.OutputObject
  >;
  getEvent(
    key: "NewPoolAdded"
  ): TypedContractEvent<
    NewPoolAddedEvent.InputTuple,
    NewPoolAddedEvent.OutputTuple,
    NewPoolAddedEvent.OutputObject
  >;

  filters: {
    "NewCreditManagerAdded(address)": TypedContractEvent<
      NewCreditManagerAddedEvent.InputTuple,
      NewCreditManagerAddedEvent.OutputTuple,
      NewCreditManagerAddedEvent.OutputObject
    >;
    NewCreditManagerAdded: TypedContractEvent<
      NewCreditManagerAddedEvent.InputTuple,
      NewCreditManagerAddedEvent.OutputTuple,
      NewCreditManagerAddedEvent.OutputObject
    >;

    "NewPoolAdded(address)": TypedContractEvent<
      NewPoolAddedEvent.InputTuple,
      NewPoolAddedEvent.OutputTuple,
      NewPoolAddedEvent.OutputObject
    >;
    NewPoolAdded: TypedContractEvent<
      NewPoolAddedEvent.InputTuple,
      NewPoolAddedEvent.OutputTuple,
      NewPoolAddedEvent.OutputObject
    >;
  };
}