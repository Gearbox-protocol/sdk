/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
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
  TypedContractMethod,
} from "../common";

export interface IGaugeV3Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "addQuotaToken"
      | "changeQuotaMaxRate"
      | "changeQuotaMinRate"
      | "epochFrozen"
      | "epochLastUpdate"
      | "getRates"
      | "isTokenAdded"
      | "pool"
      | "quotaRateParams"
      | "setFrozenEpoch"
      | "unvote"
      | "updateEpoch"
      | "userTokenVotes"
      | "version"
      | "vote"
      | "voter"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "AddQuotaToken"
      | "SetFrozenEpoch"
      | "SetQuotaTokenParams"
      | "Unvote"
      | "UpdateEpoch"
      | "Vote"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "addQuotaToken",
    values: [AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "changeQuotaMaxRate",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "changeQuotaMinRate",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "epochFrozen",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "epochLastUpdate",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRates",
    values: [AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "isTokenAdded",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "pool", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "quotaRateParams",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setFrozenEpoch",
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "unvote",
    values: [AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "updateEpoch",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "userTokenVotes",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "vote",
    values: [AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "voter", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "addQuotaToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "changeQuotaMaxRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "changeQuotaMinRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "epochFrozen",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "epochLastUpdate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getRates", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isTokenAdded",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "pool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "quotaRateParams",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setFrozenEpoch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unvote", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "updateEpoch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "userTokenVotes",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "vote", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "voter", data: BytesLike): Result;
}

export namespace AddQuotaTokenEvent {
  export type InputTuple = [
    token: AddressLike,
    minRate: BigNumberish,
    maxRate: BigNumberish
  ];
  export type OutputTuple = [token: string, minRate: bigint, maxRate: bigint];
  export interface OutputObject {
    token: string;
    minRate: bigint;
    maxRate: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetFrozenEpochEvent {
  export type InputTuple = [status: boolean];
  export type OutputTuple = [status: boolean];
  export interface OutputObject {
    status: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetQuotaTokenParamsEvent {
  export type InputTuple = [
    token: AddressLike,
    minRate: BigNumberish,
    maxRate: BigNumberish
  ];
  export type OutputTuple = [token: string, minRate: bigint, maxRate: bigint];
  export interface OutputObject {
    token: string;
    minRate: bigint;
    maxRate: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UnvoteEvent {
  export type InputTuple = [
    user: AddressLike,
    token: AddressLike,
    votes: BigNumberish,
    lpSide: boolean
  ];
  export type OutputTuple = [
    user: string,
    token: string,
    votes: bigint,
    lpSide: boolean
  ];
  export interface OutputObject {
    user: string;
    token: string;
    votes: bigint;
    lpSide: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpdateEpochEvent {
  export type InputTuple = [epochNow: BigNumberish];
  export type OutputTuple = [epochNow: bigint];
  export interface OutputObject {
    epochNow: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace VoteEvent {
  export type InputTuple = [
    user: AddressLike,
    token: AddressLike,
    votes: BigNumberish,
    lpSide: boolean
  ];
  export type OutputTuple = [
    user: string,
    token: string,
    votes: bigint,
    lpSide: boolean
  ];
  export interface OutputObject {
    user: string;
    token: string;
    votes: bigint;
    lpSide: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IGaugeV3 extends BaseContract {
  connect(runner?: ContractRunner | null): IGaugeV3;
  waitForDeployment(): Promise<this>;

  interface: IGaugeV3Interface;

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

  addQuotaToken: TypedContractMethod<
    [token: AddressLike, minRate: BigNumberish, maxRate: BigNumberish],
    [void],
    "nonpayable"
  >;

  changeQuotaMaxRate: TypedContractMethod<
    [token: AddressLike, maxRate: BigNumberish],
    [void],
    "nonpayable"
  >;

  changeQuotaMinRate: TypedContractMethod<
    [token: AddressLike, minRate: BigNumberish],
    [void],
    "nonpayable"
  >;

  epochFrozen: TypedContractMethod<[], [boolean], "view">;

  epochLastUpdate: TypedContractMethod<[], [bigint], "view">;

  getRates: TypedContractMethod<[tokens: AddressLike[]], [bigint[]], "view">;

  isTokenAdded: TypedContractMethod<[token: AddressLike], [boolean], "view">;

  pool: TypedContractMethod<[], [string], "view">;

  quotaRateParams: TypedContractMethod<
    [token: AddressLike],
    [
      [bigint, bigint, bigint, bigint] & {
        minRate: bigint;
        maxRate: bigint;
        totalVotesLpSide: bigint;
        totalVotesCaSide: bigint;
      }
    ],
    "view"
  >;

  setFrozenEpoch: TypedContractMethod<[status: boolean], [void], "nonpayable">;

  unvote: TypedContractMethod<
    [user: AddressLike, votes: BigNumberish, extraData: BytesLike],
    [void],
    "nonpayable"
  >;

  updateEpoch: TypedContractMethod<[], [void], "nonpayable">;

  userTokenVotes: TypedContractMethod<
    [user: AddressLike, token: AddressLike],
    [[bigint, bigint] & { votesLpSide: bigint; votesCaSide: bigint }],
    "view"
  >;

  version: TypedContractMethod<[], [bigint], "view">;

  vote: TypedContractMethod<
    [user: AddressLike, votes: BigNumberish, extraData: BytesLike],
    [void],
    "nonpayable"
  >;

  voter: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "addQuotaToken"
  ): TypedContractMethod<
    [token: AddressLike, minRate: BigNumberish, maxRate: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "changeQuotaMaxRate"
  ): TypedContractMethod<
    [token: AddressLike, maxRate: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "changeQuotaMinRate"
  ): TypedContractMethod<
    [token: AddressLike, minRate: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "epochFrozen"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "epochLastUpdate"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getRates"
  ): TypedContractMethod<[tokens: AddressLike[]], [bigint[]], "view">;
  getFunction(
    nameOrSignature: "isTokenAdded"
  ): TypedContractMethod<[token: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "pool"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "quotaRateParams"
  ): TypedContractMethod<
    [token: AddressLike],
    [
      [bigint, bigint, bigint, bigint] & {
        minRate: bigint;
        maxRate: bigint;
        totalVotesLpSide: bigint;
        totalVotesCaSide: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "setFrozenEpoch"
  ): TypedContractMethod<[status: boolean], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "unvote"
  ): TypedContractMethod<
    [user: AddressLike, votes: BigNumberish, extraData: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "updateEpoch"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "userTokenVotes"
  ): TypedContractMethod<
    [user: AddressLike, token: AddressLike],
    [[bigint, bigint] & { votesLpSide: bigint; votesCaSide: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "version"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "vote"
  ): TypedContractMethod<
    [user: AddressLike, votes: BigNumberish, extraData: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "voter"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "AddQuotaToken"
  ): TypedContractEvent<
    AddQuotaTokenEvent.InputTuple,
    AddQuotaTokenEvent.OutputTuple,
    AddQuotaTokenEvent.OutputObject
  >;
  getEvent(
    key: "SetFrozenEpoch"
  ): TypedContractEvent<
    SetFrozenEpochEvent.InputTuple,
    SetFrozenEpochEvent.OutputTuple,
    SetFrozenEpochEvent.OutputObject
  >;
  getEvent(
    key: "SetQuotaTokenParams"
  ): TypedContractEvent<
    SetQuotaTokenParamsEvent.InputTuple,
    SetQuotaTokenParamsEvent.OutputTuple,
    SetQuotaTokenParamsEvent.OutputObject
  >;
  getEvent(
    key: "Unvote"
  ): TypedContractEvent<
    UnvoteEvent.InputTuple,
    UnvoteEvent.OutputTuple,
    UnvoteEvent.OutputObject
  >;
  getEvent(
    key: "UpdateEpoch"
  ): TypedContractEvent<
    UpdateEpochEvent.InputTuple,
    UpdateEpochEvent.OutputTuple,
    UpdateEpochEvent.OutputObject
  >;
  getEvent(
    key: "Vote"
  ): TypedContractEvent<
    VoteEvent.InputTuple,
    VoteEvent.OutputTuple,
    VoteEvent.OutputObject
  >;

  filters: {
    "AddQuotaToken(address,uint16,uint16)": TypedContractEvent<
      AddQuotaTokenEvent.InputTuple,
      AddQuotaTokenEvent.OutputTuple,
      AddQuotaTokenEvent.OutputObject
    >;
    AddQuotaToken: TypedContractEvent<
      AddQuotaTokenEvent.InputTuple,
      AddQuotaTokenEvent.OutputTuple,
      AddQuotaTokenEvent.OutputObject
    >;

    "SetFrozenEpoch(bool)": TypedContractEvent<
      SetFrozenEpochEvent.InputTuple,
      SetFrozenEpochEvent.OutputTuple,
      SetFrozenEpochEvent.OutputObject
    >;
    SetFrozenEpoch: TypedContractEvent<
      SetFrozenEpochEvent.InputTuple,
      SetFrozenEpochEvent.OutputTuple,
      SetFrozenEpochEvent.OutputObject
    >;

    "SetQuotaTokenParams(address,uint16,uint16)": TypedContractEvent<
      SetQuotaTokenParamsEvent.InputTuple,
      SetQuotaTokenParamsEvent.OutputTuple,
      SetQuotaTokenParamsEvent.OutputObject
    >;
    SetQuotaTokenParams: TypedContractEvent<
      SetQuotaTokenParamsEvent.InputTuple,
      SetQuotaTokenParamsEvent.OutputTuple,
      SetQuotaTokenParamsEvent.OutputObject
    >;

    "Unvote(address,address,uint96,bool)": TypedContractEvent<
      UnvoteEvent.InputTuple,
      UnvoteEvent.OutputTuple,
      UnvoteEvent.OutputObject
    >;
    Unvote: TypedContractEvent<
      UnvoteEvent.InputTuple,
      UnvoteEvent.OutputTuple,
      UnvoteEvent.OutputObject
    >;

    "UpdateEpoch(uint16)": TypedContractEvent<
      UpdateEpochEvent.InputTuple,
      UpdateEpochEvent.OutputTuple,
      UpdateEpochEvent.OutputObject
    >;
    UpdateEpoch: TypedContractEvent<
      UpdateEpochEvent.InputTuple,
      UpdateEpochEvent.OutputTuple,
      UpdateEpochEvent.OutputObject
    >;

    "Vote(address,address,uint96,bool)": TypedContractEvent<
      VoteEvent.InputTuple,
      VoteEvent.OutputTuple,
      VoteEvent.OutputObject
    >;
    Vote: TypedContractEvent<
      VoteEvent.InputTuple,
      VoteEvent.OutputTuple,
      VoteEvent.OutputObject
    >;
  };
}
