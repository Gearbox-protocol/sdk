/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
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

export interface ICreditConfiguratorV2EventsInterface extends Interface {
  getEvent(
    nameOrSignatureOrTopic:
      | "AdapterForbidden"
      | "AddedToUpgradeable"
      | "ContractAllowed"
      | "ContractForbidden"
      | "CreditConfiguratorUpgraded"
      | "CreditFacadeUpgraded"
      | "CumulativeLossReset"
      | "EmergencyLiquidatorAdded"
      | "EmergencyLiquidatorRemoved"
      | "ExpirationDateUpdated"
      | "FeesUpdated"
      | "IncreaseDebtForbiddenModeChanged"
      | "LimitPerBlockUpdated"
      | "LimitsUpdated"
      | "MaxEnabledTokensUpdated"
      | "NewEmergencyLiquidationDiscount"
      | "NewMaxCumulativeLoss"
      | "NewTotalDebtLimit"
      | "PriceOracleUpgraded"
      | "RemovedFromUpgradeable"
      | "TokenAllowed"
      | "TokenForbidden"
      | "TokenLiquidationThresholdUpdated"
  ): EventFragment;
}

export namespace AdapterForbiddenEvent {
  export type InputTuple = [adapter: AddressLike];
  export type OutputTuple = [adapter: string];
  export interface OutputObject {
    adapter: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace AddedToUpgradeableEvent {
  export type InputTuple = [arg0: AddressLike];
  export type OutputTuple = [arg0: string];
  export interface OutputObject {
    arg0: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ContractAllowedEvent {
  export type InputTuple = [protocol: AddressLike, adapter: AddressLike];
  export type OutputTuple = [protocol: string, adapter: string];
  export interface OutputObject {
    protocol: string;
    adapter: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ContractForbiddenEvent {
  export type InputTuple = [protocol: AddressLike];
  export type OutputTuple = [protocol: string];
  export interface OutputObject {
    protocol: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace CreditConfiguratorUpgradedEvent {
  export type InputTuple = [newCreditConfigurator: AddressLike];
  export type OutputTuple = [newCreditConfigurator: string];
  export interface OutputObject {
    newCreditConfigurator: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace CreditFacadeUpgradedEvent {
  export type InputTuple = [newCreditFacade: AddressLike];
  export type OutputTuple = [newCreditFacade: string];
  export interface OutputObject {
    newCreditFacade: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace CumulativeLossResetEvent {
  export type InputTuple = [];
  export type OutputTuple = [];
  export interface OutputObject {}
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace EmergencyLiquidatorAddedEvent {
  export type InputTuple = [arg0: AddressLike];
  export type OutputTuple = [arg0: string];
  export interface OutputObject {
    arg0: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace EmergencyLiquidatorRemovedEvent {
  export type InputTuple = [arg0: AddressLike];
  export type OutputTuple = [arg0: string];
  export interface OutputObject {
    arg0: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ExpirationDateUpdatedEvent {
  export type InputTuple = [arg0: BigNumberish];
  export type OutputTuple = [arg0: bigint];
  export interface OutputObject {
    arg0: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace FeesUpdatedEvent {
  export type InputTuple = [
    feeInterest: BigNumberish,
    feeLiquidation: BigNumberish,
    liquidationPremium: BigNumberish,
    feeLiquidationExpired: BigNumberish,
    liquidationPremiumExpired: BigNumberish
  ];
  export type OutputTuple = [
    feeInterest: bigint,
    feeLiquidation: bigint,
    liquidationPremium: bigint,
    feeLiquidationExpired: bigint,
    liquidationPremiumExpired: bigint
  ];
  export interface OutputObject {
    feeInterest: bigint;
    feeLiquidation: bigint;
    liquidationPremium: bigint;
    feeLiquidationExpired: bigint;
    liquidationPremiumExpired: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace IncreaseDebtForbiddenModeChangedEvent {
  export type InputTuple = [arg0: boolean];
  export type OutputTuple = [arg0: boolean];
  export interface OutputObject {
    arg0: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace LimitPerBlockUpdatedEvent {
  export type InputTuple = [arg0: BigNumberish];
  export type OutputTuple = [arg0: bigint];
  export interface OutputObject {
    arg0: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace LimitsUpdatedEvent {
  export type InputTuple = [
    minBorrowedAmount: BigNumberish,
    maxBorrowedAmount: BigNumberish
  ];
  export type OutputTuple = [
    minBorrowedAmount: bigint,
    maxBorrowedAmount: bigint
  ];
  export interface OutputObject {
    minBorrowedAmount: bigint;
    maxBorrowedAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace MaxEnabledTokensUpdatedEvent {
  export type InputTuple = [arg0: BigNumberish];
  export type OutputTuple = [arg0: bigint];
  export interface OutputObject {
    arg0: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace NewEmergencyLiquidationDiscountEvent {
  export type InputTuple = [arg0: BigNumberish];
  export type OutputTuple = [arg0: bigint];
  export interface OutputObject {
    arg0: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace NewMaxCumulativeLossEvent {
  export type InputTuple = [arg0: BigNumberish];
  export type OutputTuple = [arg0: bigint];
  export interface OutputObject {
    arg0: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace NewTotalDebtLimitEvent {
  export type InputTuple = [arg0: BigNumberish];
  export type OutputTuple = [arg0: bigint];
  export interface OutputObject {
    arg0: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PriceOracleUpgradedEvent {
  export type InputTuple = [newPriceOracle: AddressLike];
  export type OutputTuple = [newPriceOracle: string];
  export interface OutputObject {
    newPriceOracle: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RemovedFromUpgradeableEvent {
  export type InputTuple = [arg0: AddressLike];
  export type OutputTuple = [arg0: string];
  export interface OutputObject {
    arg0: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TokenAllowedEvent {
  export type InputTuple = [token: AddressLike];
  export type OutputTuple = [token: string];
  export interface OutputObject {
    token: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TokenForbiddenEvent {
  export type InputTuple = [token: AddressLike];
  export type OutputTuple = [token: string];
  export interface OutputObject {
    token: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TokenLiquidationThresholdUpdatedEvent {
  export type InputTuple = [
    token: AddressLike,
    liquidityThreshold: BigNumberish
  ];
  export type OutputTuple = [token: string, liquidityThreshold: bigint];
  export interface OutputObject {
    token: string;
    liquidityThreshold: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ICreditConfiguratorV2Events extends BaseContract {
  connect(runner?: ContractRunner | null): ICreditConfiguratorV2Events;
  waitForDeployment(): Promise<this>;

  interface: ICreditConfiguratorV2EventsInterface;

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
    key: "AdapterForbidden"
  ): TypedContractEvent<
    AdapterForbiddenEvent.InputTuple,
    AdapterForbiddenEvent.OutputTuple,
    AdapterForbiddenEvent.OutputObject
  >;
  getEvent(
    key: "AddedToUpgradeable"
  ): TypedContractEvent<
    AddedToUpgradeableEvent.InputTuple,
    AddedToUpgradeableEvent.OutputTuple,
    AddedToUpgradeableEvent.OutputObject
  >;
  getEvent(
    key: "ContractAllowed"
  ): TypedContractEvent<
    ContractAllowedEvent.InputTuple,
    ContractAllowedEvent.OutputTuple,
    ContractAllowedEvent.OutputObject
  >;
  getEvent(
    key: "ContractForbidden"
  ): TypedContractEvent<
    ContractForbiddenEvent.InputTuple,
    ContractForbiddenEvent.OutputTuple,
    ContractForbiddenEvent.OutputObject
  >;
  getEvent(
    key: "CreditConfiguratorUpgraded"
  ): TypedContractEvent<
    CreditConfiguratorUpgradedEvent.InputTuple,
    CreditConfiguratorUpgradedEvent.OutputTuple,
    CreditConfiguratorUpgradedEvent.OutputObject
  >;
  getEvent(
    key: "CreditFacadeUpgraded"
  ): TypedContractEvent<
    CreditFacadeUpgradedEvent.InputTuple,
    CreditFacadeUpgradedEvent.OutputTuple,
    CreditFacadeUpgradedEvent.OutputObject
  >;
  getEvent(
    key: "CumulativeLossReset"
  ): TypedContractEvent<
    CumulativeLossResetEvent.InputTuple,
    CumulativeLossResetEvent.OutputTuple,
    CumulativeLossResetEvent.OutputObject
  >;
  getEvent(
    key: "EmergencyLiquidatorAdded"
  ): TypedContractEvent<
    EmergencyLiquidatorAddedEvent.InputTuple,
    EmergencyLiquidatorAddedEvent.OutputTuple,
    EmergencyLiquidatorAddedEvent.OutputObject
  >;
  getEvent(
    key: "EmergencyLiquidatorRemoved"
  ): TypedContractEvent<
    EmergencyLiquidatorRemovedEvent.InputTuple,
    EmergencyLiquidatorRemovedEvent.OutputTuple,
    EmergencyLiquidatorRemovedEvent.OutputObject
  >;
  getEvent(
    key: "ExpirationDateUpdated"
  ): TypedContractEvent<
    ExpirationDateUpdatedEvent.InputTuple,
    ExpirationDateUpdatedEvent.OutputTuple,
    ExpirationDateUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "FeesUpdated"
  ): TypedContractEvent<
    FeesUpdatedEvent.InputTuple,
    FeesUpdatedEvent.OutputTuple,
    FeesUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "IncreaseDebtForbiddenModeChanged"
  ): TypedContractEvent<
    IncreaseDebtForbiddenModeChangedEvent.InputTuple,
    IncreaseDebtForbiddenModeChangedEvent.OutputTuple,
    IncreaseDebtForbiddenModeChangedEvent.OutputObject
  >;
  getEvent(
    key: "LimitPerBlockUpdated"
  ): TypedContractEvent<
    LimitPerBlockUpdatedEvent.InputTuple,
    LimitPerBlockUpdatedEvent.OutputTuple,
    LimitPerBlockUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "LimitsUpdated"
  ): TypedContractEvent<
    LimitsUpdatedEvent.InputTuple,
    LimitsUpdatedEvent.OutputTuple,
    LimitsUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "MaxEnabledTokensUpdated"
  ): TypedContractEvent<
    MaxEnabledTokensUpdatedEvent.InputTuple,
    MaxEnabledTokensUpdatedEvent.OutputTuple,
    MaxEnabledTokensUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "NewEmergencyLiquidationDiscount"
  ): TypedContractEvent<
    NewEmergencyLiquidationDiscountEvent.InputTuple,
    NewEmergencyLiquidationDiscountEvent.OutputTuple,
    NewEmergencyLiquidationDiscountEvent.OutputObject
  >;
  getEvent(
    key: "NewMaxCumulativeLoss"
  ): TypedContractEvent<
    NewMaxCumulativeLossEvent.InputTuple,
    NewMaxCumulativeLossEvent.OutputTuple,
    NewMaxCumulativeLossEvent.OutputObject
  >;
  getEvent(
    key: "NewTotalDebtLimit"
  ): TypedContractEvent<
    NewTotalDebtLimitEvent.InputTuple,
    NewTotalDebtLimitEvent.OutputTuple,
    NewTotalDebtLimitEvent.OutputObject
  >;
  getEvent(
    key: "PriceOracleUpgraded"
  ): TypedContractEvent<
    PriceOracleUpgradedEvent.InputTuple,
    PriceOracleUpgradedEvent.OutputTuple,
    PriceOracleUpgradedEvent.OutputObject
  >;
  getEvent(
    key: "RemovedFromUpgradeable"
  ): TypedContractEvent<
    RemovedFromUpgradeableEvent.InputTuple,
    RemovedFromUpgradeableEvent.OutputTuple,
    RemovedFromUpgradeableEvent.OutputObject
  >;
  getEvent(
    key: "TokenAllowed"
  ): TypedContractEvent<
    TokenAllowedEvent.InputTuple,
    TokenAllowedEvent.OutputTuple,
    TokenAllowedEvent.OutputObject
  >;
  getEvent(
    key: "TokenForbidden"
  ): TypedContractEvent<
    TokenForbiddenEvent.InputTuple,
    TokenForbiddenEvent.OutputTuple,
    TokenForbiddenEvent.OutputObject
  >;
  getEvent(
    key: "TokenLiquidationThresholdUpdated"
  ): TypedContractEvent<
    TokenLiquidationThresholdUpdatedEvent.InputTuple,
    TokenLiquidationThresholdUpdatedEvent.OutputTuple,
    TokenLiquidationThresholdUpdatedEvent.OutputObject
  >;

  filters: {
    "AdapterForbidden(address)": TypedContractEvent<
      AdapterForbiddenEvent.InputTuple,
      AdapterForbiddenEvent.OutputTuple,
      AdapterForbiddenEvent.OutputObject
    >;
    AdapterForbidden: TypedContractEvent<
      AdapterForbiddenEvent.InputTuple,
      AdapterForbiddenEvent.OutputTuple,
      AdapterForbiddenEvent.OutputObject
    >;

    "AddedToUpgradeable(address)": TypedContractEvent<
      AddedToUpgradeableEvent.InputTuple,
      AddedToUpgradeableEvent.OutputTuple,
      AddedToUpgradeableEvent.OutputObject
    >;
    AddedToUpgradeable: TypedContractEvent<
      AddedToUpgradeableEvent.InputTuple,
      AddedToUpgradeableEvent.OutputTuple,
      AddedToUpgradeableEvent.OutputObject
    >;

    "ContractAllowed(address,address)": TypedContractEvent<
      ContractAllowedEvent.InputTuple,
      ContractAllowedEvent.OutputTuple,
      ContractAllowedEvent.OutputObject
    >;
    ContractAllowed: TypedContractEvent<
      ContractAllowedEvent.InputTuple,
      ContractAllowedEvent.OutputTuple,
      ContractAllowedEvent.OutputObject
    >;

    "ContractForbidden(address)": TypedContractEvent<
      ContractForbiddenEvent.InputTuple,
      ContractForbiddenEvent.OutputTuple,
      ContractForbiddenEvent.OutputObject
    >;
    ContractForbidden: TypedContractEvent<
      ContractForbiddenEvent.InputTuple,
      ContractForbiddenEvent.OutputTuple,
      ContractForbiddenEvent.OutputObject
    >;

    "CreditConfiguratorUpgraded(address)": TypedContractEvent<
      CreditConfiguratorUpgradedEvent.InputTuple,
      CreditConfiguratorUpgradedEvent.OutputTuple,
      CreditConfiguratorUpgradedEvent.OutputObject
    >;
    CreditConfiguratorUpgraded: TypedContractEvent<
      CreditConfiguratorUpgradedEvent.InputTuple,
      CreditConfiguratorUpgradedEvent.OutputTuple,
      CreditConfiguratorUpgradedEvent.OutputObject
    >;

    "CreditFacadeUpgraded(address)": TypedContractEvent<
      CreditFacadeUpgradedEvent.InputTuple,
      CreditFacadeUpgradedEvent.OutputTuple,
      CreditFacadeUpgradedEvent.OutputObject
    >;
    CreditFacadeUpgraded: TypedContractEvent<
      CreditFacadeUpgradedEvent.InputTuple,
      CreditFacadeUpgradedEvent.OutputTuple,
      CreditFacadeUpgradedEvent.OutputObject
    >;

    "CumulativeLossReset()": TypedContractEvent<
      CumulativeLossResetEvent.InputTuple,
      CumulativeLossResetEvent.OutputTuple,
      CumulativeLossResetEvent.OutputObject
    >;
    CumulativeLossReset: TypedContractEvent<
      CumulativeLossResetEvent.InputTuple,
      CumulativeLossResetEvent.OutputTuple,
      CumulativeLossResetEvent.OutputObject
    >;

    "EmergencyLiquidatorAdded(address)": TypedContractEvent<
      EmergencyLiquidatorAddedEvent.InputTuple,
      EmergencyLiquidatorAddedEvent.OutputTuple,
      EmergencyLiquidatorAddedEvent.OutputObject
    >;
    EmergencyLiquidatorAdded: TypedContractEvent<
      EmergencyLiquidatorAddedEvent.InputTuple,
      EmergencyLiquidatorAddedEvent.OutputTuple,
      EmergencyLiquidatorAddedEvent.OutputObject
    >;

    "EmergencyLiquidatorRemoved(address)": TypedContractEvent<
      EmergencyLiquidatorRemovedEvent.InputTuple,
      EmergencyLiquidatorRemovedEvent.OutputTuple,
      EmergencyLiquidatorRemovedEvent.OutputObject
    >;
    EmergencyLiquidatorRemoved: TypedContractEvent<
      EmergencyLiquidatorRemovedEvent.InputTuple,
      EmergencyLiquidatorRemovedEvent.OutputTuple,
      EmergencyLiquidatorRemovedEvent.OutputObject
    >;

    "ExpirationDateUpdated(uint40)": TypedContractEvent<
      ExpirationDateUpdatedEvent.InputTuple,
      ExpirationDateUpdatedEvent.OutputTuple,
      ExpirationDateUpdatedEvent.OutputObject
    >;
    ExpirationDateUpdated: TypedContractEvent<
      ExpirationDateUpdatedEvent.InputTuple,
      ExpirationDateUpdatedEvent.OutputTuple,
      ExpirationDateUpdatedEvent.OutputObject
    >;

    "FeesUpdated(uint16,uint16,uint16,uint16,uint16)": TypedContractEvent<
      FeesUpdatedEvent.InputTuple,
      FeesUpdatedEvent.OutputTuple,
      FeesUpdatedEvent.OutputObject
    >;
    FeesUpdated: TypedContractEvent<
      FeesUpdatedEvent.InputTuple,
      FeesUpdatedEvent.OutputTuple,
      FeesUpdatedEvent.OutputObject
    >;

    "IncreaseDebtForbiddenModeChanged(bool)": TypedContractEvent<
      IncreaseDebtForbiddenModeChangedEvent.InputTuple,
      IncreaseDebtForbiddenModeChangedEvent.OutputTuple,
      IncreaseDebtForbiddenModeChangedEvent.OutputObject
    >;
    IncreaseDebtForbiddenModeChanged: TypedContractEvent<
      IncreaseDebtForbiddenModeChangedEvent.InputTuple,
      IncreaseDebtForbiddenModeChangedEvent.OutputTuple,
      IncreaseDebtForbiddenModeChangedEvent.OutputObject
    >;

    "LimitPerBlockUpdated(uint128)": TypedContractEvent<
      LimitPerBlockUpdatedEvent.InputTuple,
      LimitPerBlockUpdatedEvent.OutputTuple,
      LimitPerBlockUpdatedEvent.OutputObject
    >;
    LimitPerBlockUpdated: TypedContractEvent<
      LimitPerBlockUpdatedEvent.InputTuple,
      LimitPerBlockUpdatedEvent.OutputTuple,
      LimitPerBlockUpdatedEvent.OutputObject
    >;

    "LimitsUpdated(uint256,uint256)": TypedContractEvent<
      LimitsUpdatedEvent.InputTuple,
      LimitsUpdatedEvent.OutputTuple,
      LimitsUpdatedEvent.OutputObject
    >;
    LimitsUpdated: TypedContractEvent<
      LimitsUpdatedEvent.InputTuple,
      LimitsUpdatedEvent.OutputTuple,
      LimitsUpdatedEvent.OutputObject
    >;

    "MaxEnabledTokensUpdated(uint8)": TypedContractEvent<
      MaxEnabledTokensUpdatedEvent.InputTuple,
      MaxEnabledTokensUpdatedEvent.OutputTuple,
      MaxEnabledTokensUpdatedEvent.OutputObject
    >;
    MaxEnabledTokensUpdated: TypedContractEvent<
      MaxEnabledTokensUpdatedEvent.InputTuple,
      MaxEnabledTokensUpdatedEvent.OutputTuple,
      MaxEnabledTokensUpdatedEvent.OutputObject
    >;

    "NewEmergencyLiquidationDiscount(uint16)": TypedContractEvent<
      NewEmergencyLiquidationDiscountEvent.InputTuple,
      NewEmergencyLiquidationDiscountEvent.OutputTuple,
      NewEmergencyLiquidationDiscountEvent.OutputObject
    >;
    NewEmergencyLiquidationDiscount: TypedContractEvent<
      NewEmergencyLiquidationDiscountEvent.InputTuple,
      NewEmergencyLiquidationDiscountEvent.OutputTuple,
      NewEmergencyLiquidationDiscountEvent.OutputObject
    >;

    "NewMaxCumulativeLoss(uint128)": TypedContractEvent<
      NewMaxCumulativeLossEvent.InputTuple,
      NewMaxCumulativeLossEvent.OutputTuple,
      NewMaxCumulativeLossEvent.OutputObject
    >;
    NewMaxCumulativeLoss: TypedContractEvent<
      NewMaxCumulativeLossEvent.InputTuple,
      NewMaxCumulativeLossEvent.OutputTuple,
      NewMaxCumulativeLossEvent.OutputObject
    >;

    "NewTotalDebtLimit(uint128)": TypedContractEvent<
      NewTotalDebtLimitEvent.InputTuple,
      NewTotalDebtLimitEvent.OutputTuple,
      NewTotalDebtLimitEvent.OutputObject
    >;
    NewTotalDebtLimit: TypedContractEvent<
      NewTotalDebtLimitEvent.InputTuple,
      NewTotalDebtLimitEvent.OutputTuple,
      NewTotalDebtLimitEvent.OutputObject
    >;

    "PriceOracleUpgraded(address)": TypedContractEvent<
      PriceOracleUpgradedEvent.InputTuple,
      PriceOracleUpgradedEvent.OutputTuple,
      PriceOracleUpgradedEvent.OutputObject
    >;
    PriceOracleUpgraded: TypedContractEvent<
      PriceOracleUpgradedEvent.InputTuple,
      PriceOracleUpgradedEvent.OutputTuple,
      PriceOracleUpgradedEvent.OutputObject
    >;

    "RemovedFromUpgradeable(address)": TypedContractEvent<
      RemovedFromUpgradeableEvent.InputTuple,
      RemovedFromUpgradeableEvent.OutputTuple,
      RemovedFromUpgradeableEvent.OutputObject
    >;
    RemovedFromUpgradeable: TypedContractEvent<
      RemovedFromUpgradeableEvent.InputTuple,
      RemovedFromUpgradeableEvent.OutputTuple,
      RemovedFromUpgradeableEvent.OutputObject
    >;

    "TokenAllowed(address)": TypedContractEvent<
      TokenAllowedEvent.InputTuple,
      TokenAllowedEvent.OutputTuple,
      TokenAllowedEvent.OutputObject
    >;
    TokenAllowed: TypedContractEvent<
      TokenAllowedEvent.InputTuple,
      TokenAllowedEvent.OutputTuple,
      TokenAllowedEvent.OutputObject
    >;

    "TokenForbidden(address)": TypedContractEvent<
      TokenForbiddenEvent.InputTuple,
      TokenForbiddenEvent.OutputTuple,
      TokenForbiddenEvent.OutputObject
    >;
    TokenForbidden: TypedContractEvent<
      TokenForbiddenEvent.InputTuple,
      TokenForbiddenEvent.OutputTuple,
      TokenForbiddenEvent.OutputObject
    >;

    "TokenLiquidationThresholdUpdated(address,uint16)": TypedContractEvent<
      TokenLiquidationThresholdUpdatedEvent.InputTuple,
      TokenLiquidationThresholdUpdatedEvent.OutputTuple,
      TokenLiquidationThresholdUpdatedEvent.OutputObject
    >;
    TokenLiquidationThresholdUpdated: TypedContractEvent<
      TokenLiquidationThresholdUpdatedEvent.InputTuple,
      TokenLiquidationThresholdUpdatedEvent.OutputTuple,
      TokenLiquidationThresholdUpdatedEvent.OutputObject
    >;
  };
}
