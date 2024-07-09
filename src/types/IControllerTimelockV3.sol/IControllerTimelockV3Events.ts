/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
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

export interface IControllerTimelockV3EventsInterface extends Interface {
  getEvent(
    nameOrSignatureOrTopic:
      | "CancelTransaction"
      | "ExecuteTransaction"
      | "QueueTransaction"
      | "SetVetoAdmin"
  ): EventFragment;
}

export namespace CancelTransactionEvent {
  export type InputTuple = [txHash: BytesLike];
  export type OutputTuple = [txHash: string];
  export interface OutputObject {
    txHash: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ExecuteTransactionEvent {
  export type InputTuple = [txHash: BytesLike];
  export type OutputTuple = [txHash: string];
  export interface OutputObject {
    txHash: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace QueueTransactionEvent {
  export type InputTuple = [
    txHash: BytesLike,
    executor: AddressLike,
    target: AddressLike,
    signature: string,
    data: BytesLike,
    eta: BigNumberish
  ];
  export type OutputTuple = [
    txHash: string,
    executor: string,
    target: string,
    signature: string,
    data: string,
    eta: bigint
  ];
  export interface OutputObject {
    txHash: string;
    executor: string;
    target: string;
    signature: string;
    data: string;
    eta: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetVetoAdminEvent {
  export type InputTuple = [newAdmin: AddressLike];
  export type OutputTuple = [newAdmin: string];
  export interface OutputObject {
    newAdmin: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IControllerTimelockV3Events extends BaseContract {
  connect(runner?: ContractRunner | null): IControllerTimelockV3Events;
  waitForDeployment(): Promise<this>;

  interface: IControllerTimelockV3EventsInterface;

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
    key: "CancelTransaction"
  ): TypedContractEvent<
    CancelTransactionEvent.InputTuple,
    CancelTransactionEvent.OutputTuple,
    CancelTransactionEvent.OutputObject
  >;
  getEvent(
    key: "ExecuteTransaction"
  ): TypedContractEvent<
    ExecuteTransactionEvent.InputTuple,
    ExecuteTransactionEvent.OutputTuple,
    ExecuteTransactionEvent.OutputObject
  >;
  getEvent(
    key: "QueueTransaction"
  ): TypedContractEvent<
    QueueTransactionEvent.InputTuple,
    QueueTransactionEvent.OutputTuple,
    QueueTransactionEvent.OutputObject
  >;
  getEvent(
    key: "SetVetoAdmin"
  ): TypedContractEvent<
    SetVetoAdminEvent.InputTuple,
    SetVetoAdminEvent.OutputTuple,
    SetVetoAdminEvent.OutputObject
  >;

  filters: {
    "CancelTransaction(bytes32)": TypedContractEvent<
      CancelTransactionEvent.InputTuple,
      CancelTransactionEvent.OutputTuple,
      CancelTransactionEvent.OutputObject
    >;
    CancelTransaction: TypedContractEvent<
      CancelTransactionEvent.InputTuple,
      CancelTransactionEvent.OutputTuple,
      CancelTransactionEvent.OutputObject
    >;

    "ExecuteTransaction(bytes32)": TypedContractEvent<
      ExecuteTransactionEvent.InputTuple,
      ExecuteTransactionEvent.OutputTuple,
      ExecuteTransactionEvent.OutputObject
    >;
    ExecuteTransaction: TypedContractEvent<
      ExecuteTransactionEvent.InputTuple,
      ExecuteTransactionEvent.OutputTuple,
      ExecuteTransactionEvent.OutputObject
    >;

    "QueueTransaction(bytes32,address,address,string,bytes,uint40)": TypedContractEvent<
      QueueTransactionEvent.InputTuple,
      QueueTransactionEvent.OutputTuple,
      QueueTransactionEvent.OutputObject
    >;
    QueueTransaction: TypedContractEvent<
      QueueTransactionEvent.InputTuple,
      QueueTransactionEvent.OutputTuple,
      QueueTransactionEvent.OutputObject
    >;

    "SetVetoAdmin(address)": TypedContractEvent<
      SetVetoAdminEvent.InputTuple,
      SetVetoAdminEvent.OutputTuple,
      SetVetoAdminEvent.OutputObject
    >;
    SetVetoAdmin: TypedContractEvent<
      SetVetoAdminEvent.InputTuple,
      SetVetoAdminEvent.OutputTuple,
      SetVetoAdminEvent.OutputObject
    >;
  };
}