import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface CreditConfiguratorTestInterface extends utils.Interface {
    functions: {
        "IS_TEST()": FunctionFragment;
        "creditConfigurator()": FunctionFragment;
        "creditFacade()": FunctionFragment;
        "creditManager()": FunctionFragment;
        "failed()": FunctionFragment;
        "setUp()": FunctionFragment;
        "test_CC_01_constructor_sets_correct_values()": FunctionFragment;
        "test_CC_02_all_functions_revert_if_called_non_configurator()": FunctionFragment;
        "test_CC_03_addCollateralToken_reverts_for_zero_address_or_in_priceFeed()": FunctionFragment;
        "test_CC_04_addCollateralToken_adds_new_token_to_creditManager_and_set_lt()": FunctionFragment;
        "test_CC_05_setLiquidationThreshold_reverts_for_underling_token_and_incorrect_values()": FunctionFragment;
        "test_CC_06_setLiquidationThreshold_sets_liquidation_threshold_in_creditManager()": FunctionFragment;
        "test_CC_07_allowToken_and_forbidToken_reverts_for_unknown_or_underlying_token()": FunctionFragment;
        "test_CC_08_allowToken_doesnt_change_forbidden_mask_if_its_already_allowed()": FunctionFragment;
        "test_CC_09_allows_token_if_it_was_forbidden()": FunctionFragment;
        "test_CC_10_forbidToken_doesnt_change_forbidden_mask_if_its_already_forbidden()": FunctionFragment;
        "test_CC_11_forbidToken_forbids_token_if_it_was_allowed()": FunctionFragment;
        "test_CC_12A_allowContract_reverts_for_non_contract_addresses()": FunctionFragment;
        "test_CC_12B_allowContract_reverts_for_non_compartible_adapter_contract()": FunctionFragment;
        "test_CC_12_allowContract_and_forbidContract_reverts_for_zero_address()": FunctionFragment;
        "test_CC_13_allowContract_reverts_for_creditManager_and_creditFacade_contracts()": FunctionFragment;
        "test_CC_14_allowContract_reverts_for_creditManager_and_creditFacade_contracts()": FunctionFragment;
        "test_CC_15_allowContract_allows_targetContract_adapter_and_emits_event()": FunctionFragment;
        "test_CC_16_forbidContract_reverts_for_unknown_contract()": FunctionFragment;
        "test_CC_17_forbidContract_forbids_contract_and_emits_event()": FunctionFragment;
        "test_CC_18_setLimits_reverts_if_minAmount_gt_maxAmount_or_maxBorrowedAmount_gt_blockLimit()": FunctionFragment;
        "test_CC_19_setLimits_sets_limits()": FunctionFragment;
        "test_CC_23_setFees_reverts_for_incorrect_fees()": FunctionFragment;
        "test_CC_25_setFees_updates_LT_for_underlying_and_for_all_tokens_which_bigger_than_new_LT()": FunctionFragment;
        "test_CC_26_setFees_sets_fees_and_doesnt_change_others()": FunctionFragment;
        "test_CC_28_upgradePriceOracle_upgrades_priceOracleCorrectly_and_doesnt_change_facade()": FunctionFragment;
        "test_CC_29_upgradeCreditFacade_upgradeCreditConfigurator_reverts_for_incompatible_contracts()": FunctionFragment;
        "test_CC_30_upgradeCreditFacade_upgrades_creditFacade_and_doesnt_change_priceOracle()": FunctionFragment;
        "test_CC_31_upgradeCreditConfigurator_upgrades_creditConfigurator()": FunctionFragment;
        "test_CC_32_setIncreaseDebtForbidden_sets_IncreaseDebtForbidden()": FunctionFragment;
        "test_CC_33_setLimitPerBlock_reverts_if_it_lt_maxLimit_otherwise_sets_limitPerBlock()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "IS_TEST" | "creditConfigurator" | "creditFacade" | "creditManager" | "failed" | "setUp" | "test_CC_01_constructor_sets_correct_values" | "test_CC_02_all_functions_revert_if_called_non_configurator" | "test_CC_03_addCollateralToken_reverts_for_zero_address_or_in_priceFeed" | "test_CC_04_addCollateralToken_adds_new_token_to_creditManager_and_set_lt" | "test_CC_05_setLiquidationThreshold_reverts_for_underling_token_and_incorrect_values" | "test_CC_06_setLiquidationThreshold_sets_liquidation_threshold_in_creditManager" | "test_CC_07_allowToken_and_forbidToken_reverts_for_unknown_or_underlying_token" | "test_CC_08_allowToken_doesnt_change_forbidden_mask_if_its_already_allowed" | "test_CC_09_allows_token_if_it_was_forbidden" | "test_CC_10_forbidToken_doesnt_change_forbidden_mask_if_its_already_forbidden" | "test_CC_11_forbidToken_forbids_token_if_it_was_allowed" | "test_CC_12A_allowContract_reverts_for_non_contract_addresses" | "test_CC_12B_allowContract_reverts_for_non_compartible_adapter_contract" | "test_CC_12_allowContract_and_forbidContract_reverts_for_zero_address" | "test_CC_13_allowContract_reverts_for_creditManager_and_creditFacade_contracts" | "test_CC_14_allowContract_reverts_for_creditManager_and_creditFacade_contracts" | "test_CC_15_allowContract_allows_targetContract_adapter_and_emits_event" | "test_CC_16_forbidContract_reverts_for_unknown_contract" | "test_CC_17_forbidContract_forbids_contract_and_emits_event" | "test_CC_18_setLimits_reverts_if_minAmount_gt_maxAmount_or_maxBorrowedAmount_gt_blockLimit" | "test_CC_19_setLimits_sets_limits" | "test_CC_23_setFees_reverts_for_incorrect_fees" | "test_CC_25_setFees_updates_LT_for_underlying_and_for_all_tokens_which_bigger_than_new_LT" | "test_CC_26_setFees_sets_fees_and_doesnt_change_others" | "test_CC_28_upgradePriceOracle_upgrades_priceOracleCorrectly_and_doesnt_change_facade" | "test_CC_29_upgradeCreditFacade_upgradeCreditConfigurator_reverts_for_incompatible_contracts" | "test_CC_30_upgradeCreditFacade_upgrades_creditFacade_and_doesnt_change_priceOracle" | "test_CC_31_upgradeCreditConfigurator_upgrades_creditConfigurator" | "test_CC_32_setIncreaseDebtForbidden_sets_IncreaseDebtForbidden" | "test_CC_33_setLimitPerBlock_reverts_if_it_lt_maxLimit_otherwise_sets_limitPerBlock"): FunctionFragment;
    encodeFunctionData(functionFragment: "IS_TEST", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditConfigurator", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditFacade", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "failed", values?: undefined): string;
    encodeFunctionData(functionFragment: "setUp", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_01_constructor_sets_correct_values", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_02_all_functions_revert_if_called_non_configurator", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_03_addCollateralToken_reverts_for_zero_address_or_in_priceFeed", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_04_addCollateralToken_adds_new_token_to_creditManager_and_set_lt", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_05_setLiquidationThreshold_reverts_for_underling_token_and_incorrect_values", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_06_setLiquidationThreshold_sets_liquidation_threshold_in_creditManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_07_allowToken_and_forbidToken_reverts_for_unknown_or_underlying_token", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_08_allowToken_doesnt_change_forbidden_mask_if_its_already_allowed", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_09_allows_token_if_it_was_forbidden", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_10_forbidToken_doesnt_change_forbidden_mask_if_its_already_forbidden", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_11_forbidToken_forbids_token_if_it_was_allowed", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_12A_allowContract_reverts_for_non_contract_addresses", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_12B_allowContract_reverts_for_non_compartible_adapter_contract", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_12_allowContract_and_forbidContract_reverts_for_zero_address", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_13_allowContract_reverts_for_creditManager_and_creditFacade_contracts", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_14_allowContract_reverts_for_creditManager_and_creditFacade_contracts", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_15_allowContract_allows_targetContract_adapter_and_emits_event", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_16_forbidContract_reverts_for_unknown_contract", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_17_forbidContract_forbids_contract_and_emits_event", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_18_setLimits_reverts_if_minAmount_gt_maxAmount_or_maxBorrowedAmount_gt_blockLimit", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_19_setLimits_sets_limits", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_23_setFees_reverts_for_incorrect_fees", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_25_setFees_updates_LT_for_underlying_and_for_all_tokens_which_bigger_than_new_LT", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_26_setFees_sets_fees_and_doesnt_change_others", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_28_upgradePriceOracle_upgrades_priceOracleCorrectly_and_doesnt_change_facade", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_29_upgradeCreditFacade_upgradeCreditConfigurator_reverts_for_incompatible_contracts", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_30_upgradeCreditFacade_upgrades_creditFacade_and_doesnt_change_priceOracle", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_31_upgradeCreditConfigurator_upgrades_creditConfigurator", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_32_setIncreaseDebtForbidden_sets_IncreaseDebtForbidden", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CC_33_setLimitPerBlock_reverts_if_it_lt_maxLimit_otherwise_sets_limitPerBlock", values?: undefined): string;
    decodeFunctionResult(functionFragment: "IS_TEST", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditConfigurator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditFacade", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "failed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setUp", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_01_constructor_sets_correct_values", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_02_all_functions_revert_if_called_non_configurator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_03_addCollateralToken_reverts_for_zero_address_or_in_priceFeed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_04_addCollateralToken_adds_new_token_to_creditManager_and_set_lt", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_05_setLiquidationThreshold_reverts_for_underling_token_and_incorrect_values", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_06_setLiquidationThreshold_sets_liquidation_threshold_in_creditManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_07_allowToken_and_forbidToken_reverts_for_unknown_or_underlying_token", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_08_allowToken_doesnt_change_forbidden_mask_if_its_already_allowed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_09_allows_token_if_it_was_forbidden", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_10_forbidToken_doesnt_change_forbidden_mask_if_its_already_forbidden", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_11_forbidToken_forbids_token_if_it_was_allowed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_12A_allowContract_reverts_for_non_contract_addresses", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_12B_allowContract_reverts_for_non_compartible_adapter_contract", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_12_allowContract_and_forbidContract_reverts_for_zero_address", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_13_allowContract_reverts_for_creditManager_and_creditFacade_contracts", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_14_allowContract_reverts_for_creditManager_and_creditFacade_contracts", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_15_allowContract_allows_targetContract_adapter_and_emits_event", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_16_forbidContract_reverts_for_unknown_contract", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_17_forbidContract_forbids_contract_and_emits_event", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_18_setLimits_reverts_if_minAmount_gt_maxAmount_or_maxBorrowedAmount_gt_blockLimit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_19_setLimits_sets_limits", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_23_setFees_reverts_for_incorrect_fees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_25_setFees_updates_LT_for_underlying_and_for_all_tokens_which_bigger_than_new_LT", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_26_setFees_sets_fees_and_doesnt_change_others", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_28_upgradePriceOracle_upgrades_priceOracleCorrectly_and_doesnt_change_facade", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_29_upgradeCreditFacade_upgradeCreditConfigurator_reverts_for_incompatible_contracts", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_30_upgradeCreditFacade_upgrades_creditFacade_and_doesnt_change_priceOracle", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_31_upgradeCreditConfigurator_upgrades_creditConfigurator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_32_setIncreaseDebtForbidden_sets_IncreaseDebtForbidden", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CC_33_setLimitPerBlock_reverts_if_it_lt_maxLimit_otherwise_sets_limitPerBlock", data: BytesLike): Result;
    events: {
        "ContractAllowed(address,address)": EventFragment;
        "ContractForbidden(address)": EventFragment;
        "CreditConfiguratorUpgraded(address)": EventFragment;
        "CreditFacadeUpgraded(address)": EventFragment;
        "DegenModeUpdated(bool)": EventFragment;
        "ExecuteOrder(address,address)": EventFragment;
        "FeesUpdated(uint16,uint16,uint16)": EventFragment;
        "IncreaseDebtModeUpdated(bool)": EventFragment;
        "LimitPerBlockUpdated(uint128)": EventFragment;
        "LimitsUpdated(uint256,uint256)": EventFragment;
        "NewConfigurator(address)": EventFragment;
        "PriceOracleUpgraded(address)": EventFragment;
        "TokenAllowed(address)": EventFragment;
        "TokenForbidden(address)": EventFragment;
        "TokenLiquidationThresholdUpdated(address,uint16)": EventFragment;
        "log(string)": EventFragment;
        "log_address(address)": EventFragment;
        "log_bytes(bytes)": EventFragment;
        "log_bytes32(bytes32)": EventFragment;
        "log_int(int256)": EventFragment;
        "log_named_address(string,address)": EventFragment;
        "log_named_bytes(string,bytes)": EventFragment;
        "log_named_bytes32(string,bytes32)": EventFragment;
        "log_named_decimal_int(string,int256,uint256)": EventFragment;
        "log_named_decimal_uint(string,uint256,uint256)": EventFragment;
        "log_named_int(string,int256)": EventFragment;
        "log_named_string(string,string)": EventFragment;
        "log_named_uint(string,uint256)": EventFragment;
        "log_string(string)": EventFragment;
        "log_uint(uint256)": EventFragment;
        "logs(bytes)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ContractAllowed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ContractForbidden"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "CreditConfiguratorUpgraded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "CreditFacadeUpgraded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "DegenModeUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExecuteOrder"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "FeesUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IncreaseDebtModeUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "LimitPerBlockUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "LimitsUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewConfigurator"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PriceOracleUpgraded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenAllowed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenForbidden"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenLiquidationThresholdUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_address"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_bytes"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_bytes32"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_int"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_named_address"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_named_bytes"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_named_bytes32"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_named_decimal_int"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_named_decimal_uint"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_named_int"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_named_string"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_named_uint"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_string"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "log_uint"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "logs"): EventFragment;
}
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
export interface ExecuteOrderEventObject {
    borrower: string;
    target: string;
}
export declare type ExecuteOrderEvent = TypedEvent<[
    string,
    string
], ExecuteOrderEventObject>;
export declare type ExecuteOrderEventFilter = TypedEventFilter<ExecuteOrderEvent>;
export interface FeesUpdatedEventObject {
    feeInterest: number;
    feeLiquidation: number;
    liquidationPremium: number;
}
export declare type FeesUpdatedEvent = TypedEvent<[
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
export interface NewConfiguratorEventObject {
    newConfigurator: string;
}
export declare type NewConfiguratorEvent = TypedEvent<[
    string
], NewConfiguratorEventObject>;
export declare type NewConfiguratorEventFilter = TypedEventFilter<NewConfiguratorEvent>;
export interface PriceOracleUpgradedEventObject {
    newPriceOracle: string;
}
export declare type PriceOracleUpgradedEvent = TypedEvent<[
    string
], PriceOracleUpgradedEventObject>;
export declare type PriceOracleUpgradedEventFilter = TypedEventFilter<PriceOracleUpgradedEvent>;
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
export interface logEventObject {
    arg0: string;
}
export declare type logEvent = TypedEvent<[string], logEventObject>;
export declare type logEventFilter = TypedEventFilter<logEvent>;
export interface log_addressEventObject {
    arg0: string;
}
export declare type log_addressEvent = TypedEvent<[string], log_addressEventObject>;
export declare type log_addressEventFilter = TypedEventFilter<log_addressEvent>;
export interface log_bytesEventObject {
    arg0: string;
}
export declare type log_bytesEvent = TypedEvent<[string], log_bytesEventObject>;
export declare type log_bytesEventFilter = TypedEventFilter<log_bytesEvent>;
export interface log_bytes32EventObject {
    arg0: string;
}
export declare type log_bytes32Event = TypedEvent<[string], log_bytes32EventObject>;
export declare type log_bytes32EventFilter = TypedEventFilter<log_bytes32Event>;
export interface log_intEventObject {
    arg0: BigNumber;
}
export declare type log_intEvent = TypedEvent<[BigNumber], log_intEventObject>;
export declare type log_intEventFilter = TypedEventFilter<log_intEvent>;
export interface log_named_addressEventObject {
    key: string;
    val: string;
}
export declare type log_named_addressEvent = TypedEvent<[
    string,
    string
], log_named_addressEventObject>;
export declare type log_named_addressEventFilter = TypedEventFilter<log_named_addressEvent>;
export interface log_named_bytesEventObject {
    key: string;
    val: string;
}
export declare type log_named_bytesEvent = TypedEvent<[
    string,
    string
], log_named_bytesEventObject>;
export declare type log_named_bytesEventFilter = TypedEventFilter<log_named_bytesEvent>;
export interface log_named_bytes32EventObject {
    key: string;
    val: string;
}
export declare type log_named_bytes32Event = TypedEvent<[
    string,
    string
], log_named_bytes32EventObject>;
export declare type log_named_bytes32EventFilter = TypedEventFilter<log_named_bytes32Event>;
export interface log_named_decimal_intEventObject {
    key: string;
    val: BigNumber;
    decimals: BigNumber;
}
export declare type log_named_decimal_intEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], log_named_decimal_intEventObject>;
export declare type log_named_decimal_intEventFilter = TypedEventFilter<log_named_decimal_intEvent>;
export interface log_named_decimal_uintEventObject {
    key: string;
    val: BigNumber;
    decimals: BigNumber;
}
export declare type log_named_decimal_uintEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], log_named_decimal_uintEventObject>;
export declare type log_named_decimal_uintEventFilter = TypedEventFilter<log_named_decimal_uintEvent>;
export interface log_named_intEventObject {
    key: string;
    val: BigNumber;
}
export declare type log_named_intEvent = TypedEvent<[
    string,
    BigNumber
], log_named_intEventObject>;
export declare type log_named_intEventFilter = TypedEventFilter<log_named_intEvent>;
export interface log_named_stringEventObject {
    key: string;
    val: string;
}
export declare type log_named_stringEvent = TypedEvent<[
    string,
    string
], log_named_stringEventObject>;
export declare type log_named_stringEventFilter = TypedEventFilter<log_named_stringEvent>;
export interface log_named_uintEventObject {
    key: string;
    val: BigNumber;
}
export declare type log_named_uintEvent = TypedEvent<[
    string,
    BigNumber
], log_named_uintEventObject>;
export declare type log_named_uintEventFilter = TypedEventFilter<log_named_uintEvent>;
export interface log_stringEventObject {
    arg0: string;
}
export declare type log_stringEvent = TypedEvent<[string], log_stringEventObject>;
export declare type log_stringEventFilter = TypedEventFilter<log_stringEvent>;
export interface log_uintEventObject {
    arg0: BigNumber;
}
export declare type log_uintEvent = TypedEvent<[BigNumber], log_uintEventObject>;
export declare type log_uintEventFilter = TypedEventFilter<log_uintEvent>;
export interface logsEventObject {
    arg0: string;
}
export declare type logsEvent = TypedEvent<[string], logsEventObject>;
export declare type logsEventFilter = TypedEventFilter<logsEvent>;
export interface CreditConfiguratorTest extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: CreditConfiguratorTestInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        IS_TEST(overrides?: CallOverrides): Promise<[boolean]>;
        creditConfigurator(overrides?: CallOverrides): Promise<[string]>;
        creditFacade(overrides?: CallOverrides): Promise<[string]>;
        creditManager(overrides?: CallOverrides): Promise<[string]>;
        failed(overrides?: CallOverrides): Promise<[boolean]>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_01_constructor_sets_correct_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_02_all_functions_revert_if_called_non_configurator(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_03_addCollateralToken_reverts_for_zero_address_or_in_priceFeed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_04_addCollateralToken_adds_new_token_to_creditManager_and_set_lt(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_05_setLiquidationThreshold_reverts_for_underling_token_and_incorrect_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_06_setLiquidationThreshold_sets_liquidation_threshold_in_creditManager(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_07_allowToken_and_forbidToken_reverts_for_unknown_or_underlying_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_08_allowToken_doesnt_change_forbidden_mask_if_its_already_allowed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_09_allows_token_if_it_was_forbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_10_forbidToken_doesnt_change_forbidden_mask_if_its_already_forbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_11_forbidToken_forbids_token_if_it_was_allowed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_12A_allowContract_reverts_for_non_contract_addresses(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_12B_allowContract_reverts_for_non_compartible_adapter_contract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_12_allowContract_and_forbidContract_reverts_for_zero_address(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_13_allowContract_reverts_for_creditManager_and_creditFacade_contracts(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_14_allowContract_reverts_for_creditManager_and_creditFacade_contracts(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_15_allowContract_allows_targetContract_adapter_and_emits_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_16_forbidContract_reverts_for_unknown_contract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_17_forbidContract_forbids_contract_and_emits_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_18_setLimits_reverts_if_minAmount_gt_maxAmount_or_maxBorrowedAmount_gt_blockLimit(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_19_setLimits_sets_limits(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_23_setFees_reverts_for_incorrect_fees(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_25_setFees_updates_LT_for_underlying_and_for_all_tokens_which_bigger_than_new_LT(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_26_setFees_sets_fees_and_doesnt_change_others(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_28_upgradePriceOracle_upgrades_priceOracleCorrectly_and_doesnt_change_facade(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_29_upgradeCreditFacade_upgradeCreditConfigurator_reverts_for_incompatible_contracts(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_30_upgradeCreditFacade_upgrades_creditFacade_and_doesnt_change_priceOracle(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_31_upgradeCreditConfigurator_upgrades_creditConfigurator(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_32_setIncreaseDebtForbidden_sets_IncreaseDebtForbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CC_33_setLimitPerBlock_reverts_if_it_lt_maxLimit_otherwise_sets_limitPerBlock(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
    };
    IS_TEST(overrides?: CallOverrides): Promise<boolean>;
    creditConfigurator(overrides?: CallOverrides): Promise<string>;
    creditFacade(overrides?: CallOverrides): Promise<string>;
    creditManager(overrides?: CallOverrides): Promise<string>;
    failed(overrides?: CallOverrides): Promise<boolean>;
    setUp(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_01_constructor_sets_correct_values(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_02_all_functions_revert_if_called_non_configurator(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_03_addCollateralToken_reverts_for_zero_address_or_in_priceFeed(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_04_addCollateralToken_adds_new_token_to_creditManager_and_set_lt(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_05_setLiquidationThreshold_reverts_for_underling_token_and_incorrect_values(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_06_setLiquidationThreshold_sets_liquidation_threshold_in_creditManager(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_07_allowToken_and_forbidToken_reverts_for_unknown_or_underlying_token(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_08_allowToken_doesnt_change_forbidden_mask_if_its_already_allowed(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_09_allows_token_if_it_was_forbidden(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_10_forbidToken_doesnt_change_forbidden_mask_if_its_already_forbidden(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_11_forbidToken_forbids_token_if_it_was_allowed(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_12A_allowContract_reverts_for_non_contract_addresses(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_12B_allowContract_reverts_for_non_compartible_adapter_contract(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_12_allowContract_and_forbidContract_reverts_for_zero_address(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_13_allowContract_reverts_for_creditManager_and_creditFacade_contracts(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_14_allowContract_reverts_for_creditManager_and_creditFacade_contracts(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_15_allowContract_allows_targetContract_adapter_and_emits_event(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_16_forbidContract_reverts_for_unknown_contract(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_17_forbidContract_forbids_contract_and_emits_event(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_18_setLimits_reverts_if_minAmount_gt_maxAmount_or_maxBorrowedAmount_gt_blockLimit(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_19_setLimits_sets_limits(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_23_setFees_reverts_for_incorrect_fees(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_25_setFees_updates_LT_for_underlying_and_for_all_tokens_which_bigger_than_new_LT(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_26_setFees_sets_fees_and_doesnt_change_others(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_28_upgradePriceOracle_upgrades_priceOracleCorrectly_and_doesnt_change_facade(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_29_upgradeCreditFacade_upgradeCreditConfigurator_reverts_for_incompatible_contracts(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_30_upgradeCreditFacade_upgrades_creditFacade_and_doesnt_change_priceOracle(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_31_upgradeCreditConfigurator_upgrades_creditConfigurator(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_32_setIncreaseDebtForbidden_sets_IncreaseDebtForbidden(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CC_33_setLimitPerBlock_reverts_if_it_lt_maxLimit_otherwise_sets_limitPerBlock(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        IS_TEST(overrides?: CallOverrides): Promise<boolean>;
        creditConfigurator(overrides?: CallOverrides): Promise<string>;
        creditFacade(overrides?: CallOverrides): Promise<string>;
        creditManager(overrides?: CallOverrides): Promise<string>;
        failed(overrides?: CallOverrides): Promise<boolean>;
        setUp(overrides?: CallOverrides): Promise<void>;
        test_CC_01_constructor_sets_correct_values(overrides?: CallOverrides): Promise<void>;
        test_CC_02_all_functions_revert_if_called_non_configurator(overrides?: CallOverrides): Promise<void>;
        test_CC_03_addCollateralToken_reverts_for_zero_address_or_in_priceFeed(overrides?: CallOverrides): Promise<void>;
        test_CC_04_addCollateralToken_adds_new_token_to_creditManager_and_set_lt(overrides?: CallOverrides): Promise<void>;
        test_CC_05_setLiquidationThreshold_reverts_for_underling_token_and_incorrect_values(overrides?: CallOverrides): Promise<void>;
        test_CC_06_setLiquidationThreshold_sets_liquidation_threshold_in_creditManager(overrides?: CallOverrides): Promise<void>;
        test_CC_07_allowToken_and_forbidToken_reverts_for_unknown_or_underlying_token(overrides?: CallOverrides): Promise<void>;
        test_CC_08_allowToken_doesnt_change_forbidden_mask_if_its_already_allowed(overrides?: CallOverrides): Promise<void>;
        test_CC_09_allows_token_if_it_was_forbidden(overrides?: CallOverrides): Promise<void>;
        test_CC_10_forbidToken_doesnt_change_forbidden_mask_if_its_already_forbidden(overrides?: CallOverrides): Promise<void>;
        test_CC_11_forbidToken_forbids_token_if_it_was_allowed(overrides?: CallOverrides): Promise<void>;
        test_CC_12A_allowContract_reverts_for_non_contract_addresses(overrides?: CallOverrides): Promise<void>;
        test_CC_12B_allowContract_reverts_for_non_compartible_adapter_contract(overrides?: CallOverrides): Promise<void>;
        test_CC_12_allowContract_and_forbidContract_reverts_for_zero_address(overrides?: CallOverrides): Promise<void>;
        test_CC_13_allowContract_reverts_for_creditManager_and_creditFacade_contracts(overrides?: CallOverrides): Promise<void>;
        test_CC_14_allowContract_reverts_for_creditManager_and_creditFacade_contracts(overrides?: CallOverrides): Promise<void>;
        test_CC_15_allowContract_allows_targetContract_adapter_and_emits_event(overrides?: CallOverrides): Promise<void>;
        test_CC_16_forbidContract_reverts_for_unknown_contract(overrides?: CallOverrides): Promise<void>;
        test_CC_17_forbidContract_forbids_contract_and_emits_event(overrides?: CallOverrides): Promise<void>;
        test_CC_18_setLimits_reverts_if_minAmount_gt_maxAmount_or_maxBorrowedAmount_gt_blockLimit(overrides?: CallOverrides): Promise<void>;
        test_CC_19_setLimits_sets_limits(overrides?: CallOverrides): Promise<void>;
        test_CC_23_setFees_reverts_for_incorrect_fees(overrides?: CallOverrides): Promise<void>;
        test_CC_25_setFees_updates_LT_for_underlying_and_for_all_tokens_which_bigger_than_new_LT(overrides?: CallOverrides): Promise<void>;
        test_CC_26_setFees_sets_fees_and_doesnt_change_others(overrides?: CallOverrides): Promise<void>;
        test_CC_28_upgradePriceOracle_upgrades_priceOracleCorrectly_and_doesnt_change_facade(overrides?: CallOverrides): Promise<void>;
        test_CC_29_upgradeCreditFacade_upgradeCreditConfigurator_reverts_for_incompatible_contracts(overrides?: CallOverrides): Promise<void>;
        test_CC_30_upgradeCreditFacade_upgrades_creditFacade_and_doesnt_change_priceOracle(overrides?: CallOverrides): Promise<void>;
        test_CC_31_upgradeCreditConfigurator_upgrades_creditConfigurator(overrides?: CallOverrides): Promise<void>;
        test_CC_32_setIncreaseDebtForbidden_sets_IncreaseDebtForbidden(overrides?: CallOverrides): Promise<void>;
        test_CC_33_setLimitPerBlock_reverts_if_it_lt_maxLimit_otherwise_sets_limitPerBlock(overrides?: CallOverrides): Promise<void>;
    };
    filters: {
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
        "ExecuteOrder(address,address)"(borrower?: string | null, target?: string | null): ExecuteOrderEventFilter;
        ExecuteOrder(borrower?: string | null, target?: string | null): ExecuteOrderEventFilter;
        "FeesUpdated(uint16,uint16,uint16)"(feeInterest?: null, feeLiquidation?: null, liquidationPremium?: null): FeesUpdatedEventFilter;
        FeesUpdated(feeInterest?: null, feeLiquidation?: null, liquidationPremium?: null): FeesUpdatedEventFilter;
        "IncreaseDebtModeUpdated(bool)"(arg0?: null): IncreaseDebtModeUpdatedEventFilter;
        IncreaseDebtModeUpdated(arg0?: null): IncreaseDebtModeUpdatedEventFilter;
        "LimitPerBlockUpdated(uint128)"(arg0?: null): LimitPerBlockUpdatedEventFilter;
        LimitPerBlockUpdated(arg0?: null): LimitPerBlockUpdatedEventFilter;
        "LimitsUpdated(uint256,uint256)"(minBorrowedAmount?: null, maxBorrowedAmount?: null): LimitsUpdatedEventFilter;
        LimitsUpdated(minBorrowedAmount?: null, maxBorrowedAmount?: null): LimitsUpdatedEventFilter;
        "NewConfigurator(address)"(newConfigurator?: string | null): NewConfiguratorEventFilter;
        NewConfigurator(newConfigurator?: string | null): NewConfiguratorEventFilter;
        "PriceOracleUpgraded(address)"(newPriceOracle?: string | null): PriceOracleUpgradedEventFilter;
        PriceOracleUpgraded(newPriceOracle?: string | null): PriceOracleUpgradedEventFilter;
        "TokenAllowed(address)"(token?: string | null): TokenAllowedEventFilter;
        TokenAllowed(token?: string | null): TokenAllowedEventFilter;
        "TokenForbidden(address)"(token?: string | null): TokenForbiddenEventFilter;
        TokenForbidden(token?: string | null): TokenForbiddenEventFilter;
        "TokenLiquidationThresholdUpdated(address,uint16)"(token?: string | null, liquidityThreshold?: null): TokenLiquidationThresholdUpdatedEventFilter;
        TokenLiquidationThresholdUpdated(token?: string | null, liquidityThreshold?: null): TokenLiquidationThresholdUpdatedEventFilter;
        "log(string)"(arg0?: null): logEventFilter;
        log(arg0?: null): logEventFilter;
        "log_address(address)"(arg0?: null): log_addressEventFilter;
        log_address(arg0?: null): log_addressEventFilter;
        "log_bytes(bytes)"(arg0?: null): log_bytesEventFilter;
        log_bytes(arg0?: null): log_bytesEventFilter;
        "log_bytes32(bytes32)"(arg0?: null): log_bytes32EventFilter;
        log_bytes32(arg0?: null): log_bytes32EventFilter;
        "log_int(int256)"(arg0?: null): log_intEventFilter;
        log_int(arg0?: null): log_intEventFilter;
        "log_named_address(string,address)"(key?: null, val?: null): log_named_addressEventFilter;
        log_named_address(key?: null, val?: null): log_named_addressEventFilter;
        "log_named_bytes(string,bytes)"(key?: null, val?: null): log_named_bytesEventFilter;
        log_named_bytes(key?: null, val?: null): log_named_bytesEventFilter;
        "log_named_bytes32(string,bytes32)"(key?: null, val?: null): log_named_bytes32EventFilter;
        log_named_bytes32(key?: null, val?: null): log_named_bytes32EventFilter;
        "log_named_decimal_int(string,int256,uint256)"(key?: null, val?: null, decimals?: null): log_named_decimal_intEventFilter;
        log_named_decimal_int(key?: null, val?: null, decimals?: null): log_named_decimal_intEventFilter;
        "log_named_decimal_uint(string,uint256,uint256)"(key?: null, val?: null, decimals?: null): log_named_decimal_uintEventFilter;
        log_named_decimal_uint(key?: null, val?: null, decimals?: null): log_named_decimal_uintEventFilter;
        "log_named_int(string,int256)"(key?: null, val?: null): log_named_intEventFilter;
        log_named_int(key?: null, val?: null): log_named_intEventFilter;
        "log_named_string(string,string)"(key?: null, val?: null): log_named_stringEventFilter;
        log_named_string(key?: null, val?: null): log_named_stringEventFilter;
        "log_named_uint(string,uint256)"(key?: null, val?: null): log_named_uintEventFilter;
        log_named_uint(key?: null, val?: null): log_named_uintEventFilter;
        "log_string(string)"(arg0?: null): log_stringEventFilter;
        log_string(arg0?: null): log_stringEventFilter;
        "log_uint(uint256)"(arg0?: null): log_uintEventFilter;
        log_uint(arg0?: null): log_uintEventFilter;
        "logs(bytes)"(arg0?: null): logsEventFilter;
        logs(arg0?: null): logsEventFilter;
    };
    estimateGas: {
        IS_TEST(overrides?: CallOverrides): Promise<BigNumber>;
        creditConfigurator(overrides?: CallOverrides): Promise<BigNumber>;
        creditFacade(overrides?: CallOverrides): Promise<BigNumber>;
        creditManager(overrides?: CallOverrides): Promise<BigNumber>;
        failed(overrides?: CallOverrides): Promise<BigNumber>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_01_constructor_sets_correct_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_02_all_functions_revert_if_called_non_configurator(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_03_addCollateralToken_reverts_for_zero_address_or_in_priceFeed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_04_addCollateralToken_adds_new_token_to_creditManager_and_set_lt(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_05_setLiquidationThreshold_reverts_for_underling_token_and_incorrect_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_06_setLiquidationThreshold_sets_liquidation_threshold_in_creditManager(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_07_allowToken_and_forbidToken_reverts_for_unknown_or_underlying_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_08_allowToken_doesnt_change_forbidden_mask_if_its_already_allowed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_09_allows_token_if_it_was_forbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_10_forbidToken_doesnt_change_forbidden_mask_if_its_already_forbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_11_forbidToken_forbids_token_if_it_was_allowed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_12A_allowContract_reverts_for_non_contract_addresses(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_12B_allowContract_reverts_for_non_compartible_adapter_contract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_12_allowContract_and_forbidContract_reverts_for_zero_address(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_13_allowContract_reverts_for_creditManager_and_creditFacade_contracts(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_14_allowContract_reverts_for_creditManager_and_creditFacade_contracts(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_15_allowContract_allows_targetContract_adapter_and_emits_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_16_forbidContract_reverts_for_unknown_contract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_17_forbidContract_forbids_contract_and_emits_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_18_setLimits_reverts_if_minAmount_gt_maxAmount_or_maxBorrowedAmount_gt_blockLimit(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_19_setLimits_sets_limits(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_23_setFees_reverts_for_incorrect_fees(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_25_setFees_updates_LT_for_underlying_and_for_all_tokens_which_bigger_than_new_LT(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_26_setFees_sets_fees_and_doesnt_change_others(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_28_upgradePriceOracle_upgrades_priceOracleCorrectly_and_doesnt_change_facade(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_29_upgradeCreditFacade_upgradeCreditConfigurator_reverts_for_incompatible_contracts(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_30_upgradeCreditFacade_upgrades_creditFacade_and_doesnt_change_priceOracle(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_31_upgradeCreditConfigurator_upgrades_creditConfigurator(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_32_setIncreaseDebtForbidden_sets_IncreaseDebtForbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CC_33_setLimitPerBlock_reverts_if_it_lt_maxLimit_otherwise_sets_limitPerBlock(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        IS_TEST(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditConfigurator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditFacade(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        failed(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_01_constructor_sets_correct_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_02_all_functions_revert_if_called_non_configurator(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_03_addCollateralToken_reverts_for_zero_address_or_in_priceFeed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_04_addCollateralToken_adds_new_token_to_creditManager_and_set_lt(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_05_setLiquidationThreshold_reverts_for_underling_token_and_incorrect_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_06_setLiquidationThreshold_sets_liquidation_threshold_in_creditManager(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_07_allowToken_and_forbidToken_reverts_for_unknown_or_underlying_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_08_allowToken_doesnt_change_forbidden_mask_if_its_already_allowed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_09_allows_token_if_it_was_forbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_10_forbidToken_doesnt_change_forbidden_mask_if_its_already_forbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_11_forbidToken_forbids_token_if_it_was_allowed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_12A_allowContract_reverts_for_non_contract_addresses(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_12B_allowContract_reverts_for_non_compartible_adapter_contract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_12_allowContract_and_forbidContract_reverts_for_zero_address(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_13_allowContract_reverts_for_creditManager_and_creditFacade_contracts(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_14_allowContract_reverts_for_creditManager_and_creditFacade_contracts(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_15_allowContract_allows_targetContract_adapter_and_emits_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_16_forbidContract_reverts_for_unknown_contract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_17_forbidContract_forbids_contract_and_emits_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_18_setLimits_reverts_if_minAmount_gt_maxAmount_or_maxBorrowedAmount_gt_blockLimit(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_19_setLimits_sets_limits(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_23_setFees_reverts_for_incorrect_fees(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_25_setFees_updates_LT_for_underlying_and_for_all_tokens_which_bigger_than_new_LT(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_26_setFees_sets_fees_and_doesnt_change_others(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_28_upgradePriceOracle_upgrades_priceOracleCorrectly_and_doesnt_change_facade(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_29_upgradeCreditFacade_upgradeCreditConfigurator_reverts_for_incompatible_contracts(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_30_upgradeCreditFacade_upgrades_creditFacade_and_doesnt_change_priceOracle(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_31_upgradeCreditConfigurator_upgrades_creditConfigurator(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_32_setIncreaseDebtForbidden_sets_IncreaseDebtForbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CC_33_setLimitPerBlock_reverts_if_it_lt_maxLimit_otherwise_sets_limitPerBlock(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
    };
}
