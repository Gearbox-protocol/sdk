import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface ICreditConfiguratorEventsInterface extends utils.Interface {
    functions: {};
    events: {
        "AddedToUpgradeable(address)": EventFragment;
        "ContractAllowed(address,address)": EventFragment;
        "ContractForbidden(address)": EventFragment;
        "CreditConfiguratorUpgraded(address)": EventFragment;
        "CreditFacadeUpgraded(address)": EventFragment;
        "DegenModeUpdated(bool)": EventFragment;
        "ExpirationDateUpdated(uint40)": EventFragment;
        "FeesUpdated(uint16,uint16,uint16,uint16,uint16)": EventFragment;
        "IncreaseDebtModeUpdated(bool)": EventFragment;
        "LimitPerBlockUpdated(uint128)": EventFragment;
        "LimitsUpdated(uint256,uint256)": EventFragment;
        "MaxEnabledTokensUpdated(uint8)": EventFragment;
        "PriceOracleUpgraded(address)": EventFragment;
        "RemovedFromUpgradeable(address)": EventFragment;
        "TokenAllowed(address)": EventFragment;
        "TokenForbidden(address)": EventFragment;
        "TokenLiquidationThresholdUpdated(address,uint16)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AddedToUpgradeable"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ContractAllowed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ContractForbidden"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "CreditConfiguratorUpgraded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "CreditFacadeUpgraded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "DegenModeUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExpirationDateUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "FeesUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IncreaseDebtModeUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "LimitPerBlockUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "LimitsUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MaxEnabledTokensUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PriceOracleUpgraded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RemovedFromUpgradeable"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenAllowed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenForbidden"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenLiquidationThresholdUpdated"): EventFragment;
}
export interface AddedToUpgradeableEventObject {
    arg0: string;
}
export declare type AddedToUpgradeableEvent = TypedEvent<[
    string
], AddedToUpgradeableEventObject>;
export declare type AddedToUpgradeableEventFilter = TypedEventFilter<AddedToUpgradeableEvent>;
export interface ContractAllowedEventObject {
    protocol: string;
    adapter: string;
}
export declare type ContractAllowedEvent = TypedEvent<[
    string,
    string
], ContractAllowedEventObject>;
export declare type ContractAllowedEventFilter = TypedEventFilter<ContractAllowedEvent>;
export interface ContractForbiddenEventObject {
    protocol: string;
}
export declare type ContractForbiddenEvent = TypedEvent<[
    string
], ContractForbiddenEventObject>;
export declare type ContractForbiddenEventFilter = TypedEventFilter<ContractForbiddenEvent>;
export interface CreditConfiguratorUpgradedEventObject {
    newCreditConfigurator: string;
}
export declare type CreditConfiguratorUpgradedEvent = TypedEvent<[
    string
], CreditConfiguratorUpgradedEventObject>;
export declare type CreditConfiguratorUpgradedEventFilter = TypedEventFilter<CreditConfiguratorUpgradedEvent>;
export interface CreditFacadeUpgradedEventObject {
    newCreditFacade: string;
}
export declare type CreditFacadeUpgradedEvent = TypedEvent<[
    string
], CreditFacadeUpgradedEventObject>;
export declare type CreditFacadeUpgradedEventFilter = TypedEventFilter<CreditFacadeUpgradedEvent>;
export interface DegenModeUpdatedEventObject {
    arg0: boolean;
}
export declare type DegenModeUpdatedEvent = TypedEvent<[
    boolean
], DegenModeUpdatedEventObject>;
export declare type DegenModeUpdatedEventFilter = TypedEventFilter<DegenModeUpdatedEvent>;
export interface ExpirationDateUpdatedEventObject {
    arg0: number;
}
export declare type ExpirationDateUpdatedEvent = TypedEvent<[
    number
], ExpirationDateUpdatedEventObject>;
export declare type ExpirationDateUpdatedEventFilter = TypedEventFilter<ExpirationDateUpdatedEvent>;
export interface FeesUpdatedEventObject {
    feeInterest: number;
    feeLiquidation: number;
    liquidationPremium: number;
    feeLiquidationExpired: number;
    liquidationPremiumExpired: number;
}
export declare type FeesUpdatedEvent = TypedEvent<[
    number,
    number,
    number,
    number,
    number
], FeesUpdatedEventObject>;
export declare type FeesUpdatedEventFilter = TypedEventFilter<FeesUpdatedEvent>;
export interface IncreaseDebtModeUpdatedEventObject {
    arg0: boolean;
}
export declare type IncreaseDebtModeUpdatedEvent = TypedEvent<[
    boolean
], IncreaseDebtModeUpdatedEventObject>;
export declare type IncreaseDebtModeUpdatedEventFilter = TypedEventFilter<IncreaseDebtModeUpdatedEvent>;
export interface LimitPerBlockUpdatedEventObject {
    arg0: BigNumber;
}
export declare type LimitPerBlockUpdatedEvent = TypedEvent<[
    BigNumber
], LimitPerBlockUpdatedEventObject>;
export declare type LimitPerBlockUpdatedEventFilter = TypedEventFilter<LimitPerBlockUpdatedEvent>;
export interface LimitsUpdatedEventObject {
    minBorrowedAmount: BigNumber;
    maxBorrowedAmount: BigNumber;
}
export declare type LimitsUpdatedEvent = TypedEvent<[
    BigNumber,
    BigNumber
], LimitsUpdatedEventObject>;
export declare type LimitsUpdatedEventFilter = TypedEventFilter<LimitsUpdatedEvent>;
export interface MaxEnabledTokensUpdatedEventObject {
    arg0: number;
}
export declare type MaxEnabledTokensUpdatedEvent = TypedEvent<[
    number
], MaxEnabledTokensUpdatedEventObject>;
export declare type MaxEnabledTokensUpdatedEventFilter = TypedEventFilter<MaxEnabledTokensUpdatedEvent>;
export interface PriceOracleUpgradedEventObject {
    newPriceOracle: string;
}
export declare type PriceOracleUpgradedEvent = TypedEvent<[
    string
], PriceOracleUpgradedEventObject>;
export declare type PriceOracleUpgradedEventFilter = TypedEventFilter<PriceOracleUpgradedEvent>;
export interface RemovedFromUpgradeableEventObject {
    arg0: string;
}
export declare type RemovedFromUpgradeableEvent = TypedEvent<[
    string
], RemovedFromUpgradeableEventObject>;
export declare type RemovedFromUpgradeableEventFilter = TypedEventFilter<RemovedFromUpgradeableEvent>;
export interface TokenAllowedEventObject {
    token: string;
}
export declare type TokenAllowedEvent = TypedEvent<[string], TokenAllowedEventObject>;
export declare type TokenAllowedEventFilter = TypedEventFilter<TokenAllowedEvent>;
export interface TokenForbiddenEventObject {
    token: string;
}
export declare type TokenForbiddenEvent = TypedEvent<[
    string
], TokenForbiddenEventObject>;
export declare type TokenForbiddenEventFilter = TypedEventFilter<TokenForbiddenEvent>;
export interface TokenLiquidationThresholdUpdatedEventObject {
    token: string;
    liquidityThreshold: number;
}
export declare type TokenLiquidationThresholdUpdatedEvent = TypedEvent<[
    string,
    number
], TokenLiquidationThresholdUpdatedEventObject>;
export declare type TokenLiquidationThresholdUpdatedEventFilter = TypedEventFilter<TokenLiquidationThresholdUpdatedEvent>;
export interface ICreditConfiguratorEvents extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ICreditConfiguratorEventsInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {};
    callStatic: {};
    filters: {
        "AddedToUpgradeable(address)"(arg0?: null): AddedToUpgradeableEventFilter;
        AddedToUpgradeable(arg0?: null): AddedToUpgradeableEventFilter;
        "ContractAllowed(address,address)"(protocol?: string | null, adapter?: string | null): ContractAllowedEventFilter;
        ContractAllowed(protocol?: string | null, adapter?: string | null): ContractAllowedEventFilter;
        "ContractForbidden(address)"(protocol?: string | null): ContractForbiddenEventFilter;
        ContractForbidden(protocol?: string | null): ContractForbiddenEventFilter;
        "CreditConfiguratorUpgraded(address)"(newCreditConfigurator?: string | null): CreditConfiguratorUpgradedEventFilter;
        CreditConfiguratorUpgraded(newCreditConfigurator?: string | null): CreditConfiguratorUpgradedEventFilter;
        "CreditFacadeUpgraded(address)"(newCreditFacade?: string | null): CreditFacadeUpgradedEventFilter;
        CreditFacadeUpgraded(newCreditFacade?: string | null): CreditFacadeUpgradedEventFilter;
        "DegenModeUpdated(bool)"(arg0?: null): DegenModeUpdatedEventFilter;
        DegenModeUpdated(arg0?: null): DegenModeUpdatedEventFilter;
        "ExpirationDateUpdated(uint40)"(arg0?: null): ExpirationDateUpdatedEventFilter;
        ExpirationDateUpdated(arg0?: null): ExpirationDateUpdatedEventFilter;
        "FeesUpdated(uint16,uint16,uint16,uint16,uint16)"(feeInterest?: null, feeLiquidation?: null, liquidationPremium?: null, feeLiquidationExpired?: null, liquidationPremiumExpired?: null): FeesUpdatedEventFilter;
        FeesUpdated(feeInterest?: null, feeLiquidation?: null, liquidationPremium?: null, feeLiquidationExpired?: null, liquidationPremiumExpired?: null): FeesUpdatedEventFilter;
        "IncreaseDebtModeUpdated(bool)"(arg0?: null): IncreaseDebtModeUpdatedEventFilter;
        IncreaseDebtModeUpdated(arg0?: null): IncreaseDebtModeUpdatedEventFilter;
        "LimitPerBlockUpdated(uint128)"(arg0?: null): LimitPerBlockUpdatedEventFilter;
        LimitPerBlockUpdated(arg0?: null): LimitPerBlockUpdatedEventFilter;
        "LimitsUpdated(uint256,uint256)"(minBorrowedAmount?: null, maxBorrowedAmount?: null): LimitsUpdatedEventFilter;
        LimitsUpdated(minBorrowedAmount?: null, maxBorrowedAmount?: null): LimitsUpdatedEventFilter;
        "MaxEnabledTokensUpdated(uint8)"(arg0?: null): MaxEnabledTokensUpdatedEventFilter;
        MaxEnabledTokensUpdated(arg0?: null): MaxEnabledTokensUpdatedEventFilter;
        "PriceOracleUpgraded(address)"(newPriceOracle?: string | null): PriceOracleUpgradedEventFilter;
        PriceOracleUpgraded(newPriceOracle?: string | null): PriceOracleUpgradedEventFilter;
        "RemovedFromUpgradeable(address)"(arg0?: null): RemovedFromUpgradeableEventFilter;
        RemovedFromUpgradeable(arg0?: null): RemovedFromUpgradeableEventFilter;
        "TokenAllowed(address)"(token?: string | null): TokenAllowedEventFilter;
        TokenAllowed(token?: string | null): TokenAllowedEventFilter;
        "TokenForbidden(address)"(token?: string | null): TokenForbiddenEventFilter;
        TokenForbidden(token?: string | null): TokenForbiddenEventFilter;
        "TokenLiquidationThresholdUpdated(address,uint16)"(token?: string | null, liquidityThreshold?: null): TokenLiquidationThresholdUpdatedEventFilter;
        TokenLiquidationThresholdUpdated(token?: string | null, liquidityThreshold?: null): TokenLiquidationThresholdUpdatedEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
