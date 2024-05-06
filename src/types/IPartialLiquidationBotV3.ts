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
} from "./common";

export declare namespace IPartialLiquidationBotV3 {
  export type PriceUpdateStruct = {
    token: AddressLike;
    reserve: boolean;
    data: BytesLike;
  };

  export type PriceUpdateStructOutput = [
    token: string,
    reserve: boolean,
    data: string
  ] & { token: string; reserve: boolean; data: string };
}

export interface IPartialLiquidationBotV3Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "feeScaleFactor"
      | "liquidateExactCollateral"
      | "liquidateExactDebt"
      | "maxHealthFactor"
      | "minHealthFactor"
      | "premiumScaleFactor"
      | "treasury"
      | "version"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "LiquidatePartial"): EventFragment;

  encodeFunctionData(
    functionFragment: "feeScaleFactor",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "liquidateExactCollateral",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      AddressLike,
      IPartialLiquidationBotV3.PriceUpdateStruct[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "liquidateExactDebt",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      AddressLike,
      IPartialLiquidationBotV3.PriceUpdateStruct[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "maxHealthFactor",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "minHealthFactor",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "premiumScaleFactor",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "treasury", values?: undefined): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "feeScaleFactor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "liquidateExactCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "liquidateExactDebt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxHealthFactor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "minHealthFactor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "premiumScaleFactor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "treasury", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
}

export namespace LiquidatePartialEvent {
  export type InputTuple = [
    creditManager: AddressLike,
    creditAccount: AddressLike,
    token: AddressLike,
    repaidDebt: BigNumberish,
    seizedCollateral: BigNumberish,
    fee: BigNumberish
  ];
  export type OutputTuple = [
    creditManager: string,
    creditAccount: string,
    token: string,
    repaidDebt: bigint,
    seizedCollateral: bigint,
    fee: bigint
  ];
  export interface OutputObject {
    creditManager: string;
    creditAccount: string;
    token: string;
    repaidDebt: bigint;
    seizedCollateral: bigint;
    fee: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IPartialLiquidationBotV3 extends BaseContract {
  connect(runner?: ContractRunner | null): IPartialLiquidationBotV3;
  waitForDeployment(): Promise<this>;

  interface: IPartialLiquidationBotV3Interface;

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

  feeScaleFactor: TypedContractMethod<[], [bigint], "view">;

  liquidateExactCollateral: TypedContractMethod<
    [
      creditAccount: AddressLike,
      token: AddressLike,
      seizedAmount: BigNumberish,
      maxRepaidAmount: BigNumberish,
      to: AddressLike,
      priceUpdates: IPartialLiquidationBotV3.PriceUpdateStruct[]
    ],
    [bigint],
    "nonpayable"
  >;

  liquidateExactDebt: TypedContractMethod<
    [
      creditAccount: AddressLike,
      token: AddressLike,
      repaidAmount: BigNumberish,
      minSeizedAmount: BigNumberish,
      to: AddressLike,
      priceUpdates: IPartialLiquidationBotV3.PriceUpdateStruct[]
    ],
    [bigint],
    "nonpayable"
  >;

  maxHealthFactor: TypedContractMethod<[], [bigint], "view">;

  minHealthFactor: TypedContractMethod<[], [bigint], "view">;

  premiumScaleFactor: TypedContractMethod<[], [bigint], "view">;

  treasury: TypedContractMethod<[], [string], "view">;

  version: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "feeScaleFactor"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "liquidateExactCollateral"
  ): TypedContractMethod<
    [
      creditAccount: AddressLike,
      token: AddressLike,
      seizedAmount: BigNumberish,
      maxRepaidAmount: BigNumberish,
      to: AddressLike,
      priceUpdates: IPartialLiquidationBotV3.PriceUpdateStruct[]
    ],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "liquidateExactDebt"
  ): TypedContractMethod<
    [
      creditAccount: AddressLike,
      token: AddressLike,
      repaidAmount: BigNumberish,
      minSeizedAmount: BigNumberish,
      to: AddressLike,
      priceUpdates: IPartialLiquidationBotV3.PriceUpdateStruct[]
    ],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "maxHealthFactor"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "minHealthFactor"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "premiumScaleFactor"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "treasury"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "version"
  ): TypedContractMethod<[], [bigint], "view">;

  getEvent(
    key: "LiquidatePartial"
  ): TypedContractEvent<
    LiquidatePartialEvent.InputTuple,
    LiquidatePartialEvent.OutputTuple,
    LiquidatePartialEvent.OutputObject
  >;

  filters: {
    "LiquidatePartial(address,address,address,uint256,uint256,uint256)": TypedContractEvent<
      LiquidatePartialEvent.InputTuple,
      LiquidatePartialEvent.OutputTuple,
      LiquidatePartialEvent.OutputObject
    >;
    LiquidatePartial: TypedContractEvent<
      LiquidatePartialEvent.InputTuple,
      LiquidatePartialEvent.OutputTuple,
      LiquidatePartialEvent.OutputObject
    >;
  };
}
