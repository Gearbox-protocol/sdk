import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface CreditManagerTestInterface extends utils.Interface {
    functions: {
        "IS_TEST()": FunctionFragment;
        "failed()": FunctionFragment;
        "setUp()": FunctionFragment;
        "test_CM_01_constructor_sets_correct_values()": FunctionFragment;
        "test_CM_02_credit_account_management_functions_revert_if_not_called_by_creditFacadeCall()": FunctionFragment;
        "test_CM_03_credit_account_execution_functions_revert_if_not_called_by_creditFacade()": FunctionFragment;
        "test_CM_04_credit_account_configurator_functions_revert_if_not_called_by_creditFacade()": FunctionFragment;
        "test_CM_05_pause_pauses_management_functions()": FunctionFragment;
        "test_CM_06_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool()": FunctionFragment;
        "test_CM_07_openCreditAccount_reverts_if_zero_address_or_address_exists()": FunctionFragment;
        "test_CM_08_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool()": FunctionFragment;
        "test_CM_09_close_credit_account_returns_credit_account_and_remove_borrower_from_map()": FunctionFragment;
        "test_CM_10_close_credit_account_returns_underlying_token_if_not_liquidated()": FunctionFragment;
        "test_CM_11_close_credit_account_charges_caller_if_underlying_token_not_enough()": FunctionFragment;
        "test_CM_12_close_credit_account_charges_caller_if_underlying_token_not_enough()": FunctionFragment;
        "test_CM_13_close_credit_account_charges_caller_if_underlying_token_not_enough()": FunctionFragment;
        "test_CM_14_close_credit_account_with_nonzero_skipTokenMask_sends_correct_tokens()": FunctionFragment;
        "test_CM_16_close_weth_credit_account_sends_eth_to_borrower()": FunctionFragment;
        "test_CM_17_close_dai_credit_account_sends_eth_to_borrower()": FunctionFragment;
        "test_CM_18_close_credit_account_sends_eth_to_liquidator_and_weth_to_borrower()": FunctionFragment;
        "test_CM_19_close_dai_credit_account_sends_eth_to_liquidator()": FunctionFragment;
        "test_CM_20_manageDebt_correctly_increases_debt(uint128)": FunctionFragment;
        "test_CM_21_manageDebt_correctly_decreases_debt(uint128)": FunctionFragment;
        "test_CM_22_add_collateral_transfers_money_and_enables_token()": FunctionFragment;
        "test_CM_23_transferAccountOwnership_reverts_if_to_equals_zero_or_account_exists()": FunctionFragment;
        "test_CM_24_transferAccountOwnership_changes_creditAccounts_map_properly()": FunctionFragment;
        "test_CM_25A_approveCreditAccount_reverts_if_the_token_is_not_added()": FunctionFragment;
        "test_CM_25_approveCreditAccount_reverts_if_adapter_isnt_connected_with_contract_or_0()": FunctionFragment;
        "test_CM_26_approveCreditAccount_approves_with_desired_allowance()": FunctionFragment;
        "test_CM_27A_approveCreditAccount_works_for_ERC20_with_approve_restrictions()": FunctionFragment;
        "test_CM_27B_approveCreditAccount_works_for_ERC20_with_approve_restrictions()": FunctionFragment;
        "test_CM_28_executeOrder_reverts_if_adapter_is_not_connected_with_target_contract()": FunctionFragment;
        "test_CM_29_executeOrder_calls_credit_account_method_and_emit_event()": FunctionFragment;
        "test_CM_30_checkAndEnableToken_reverts_for_token_for_token_not_in_list_and_for_forbidden_token()": FunctionFragment;
        "test_CM_31_checkAndEnableToken_enables_token_for_creditAccount()": FunctionFragment;
        "test_CM_32_fastCollateralCheck_enables_tokenOut_and_reverts_if_its_unkown_or_forbidden()": FunctionFragment;
        "test_CM_33_fastCollateralCheck_disable_tokens_with_zero_balance(uint8)": FunctionFragment;
        "test_CM_34_fastCollateralCheck_is_passed_if_collateralOut_gte_collarteralIn()": FunctionFragment;
        "test_CM_35_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_gte_collarteralIn_wo_lt_check()": FunctionFragment;
        "test_CM_36A_fastCollateralCheck_correctly_optimizes_enabled_tokens()": FunctionFragment;
        "test_CM_36_fastCollateralCheck_is_passed_with_cumulative_drop_lte_feeLiquidation(uint256)": FunctionFragment;
        "test_CM_37_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_lt_collarteralIn_wo_lt_check()": FunctionFragment;
        "test_CM_38_fullCollateralCheck_skips_tokens_is_they_are_not_enabled()": FunctionFragment;
        "test_CM_39_fullCollateralCheck_diables_tokens_if_they_have_zero_balance()": FunctionFragment;
        "test_CM_40_fullCollateralCheck_breaks_loop_if_total_gte_borrowAmountPlusInterestRateUSD_and_pass_the_check()": FunctionFragment;
        "test_CM_41A_fullCollateralCheck_correctly_disables_the_underlying_when_needed()": FunctionFragment;
        "test_CM_41B_fullCollateralCheck_correctly_optimizes_enabled_tokens()": FunctionFragment;
        "test_CM_41_fullCollateralCheck_reverts_if_CA_has_more_than_allowed_enabled_tokens()": FunctionFragment;
        "test_CM_42_fullCollateralCheck_fuzzing_test(uint128,uint128,uint128,uint128,uint128,bool,bool,bool)": FunctionFragment;
        "test_CM_43_calcClosePayments_test()": FunctionFragment;
        "test_CM_44_transferAssetsTo_sends_all_tokens_except_underlying_one_to_provided_address()": FunctionFragment;
        "test_CM_45_safeTokenTransfer_transfers_tokens()": FunctionFragment;
        "test_CM_46__disableToken_disabale_tokens_and_do_not_enable_it_if_called_twice()": FunctionFragment;
        "test_CM_47_collateralTokens_works_as_expected(address,uint16)": FunctionFragment;
        "test_CM_48_getCreditAccountOrRevert_reverts_if_borrower_has_no_account()": FunctionFragment;
        "test_CM_49_calcCreditAccountAccruedInterest_computes_correctly(uint128)": FunctionFragment;
        "test_CM_50_getCreditAccountParameters_return_correct_values()": FunctionFragment;
        "test_CM_51_setParams_sets_configuration_properly()": FunctionFragment;
        "test_CM_52_addToken_reverts_if_token_exists_and_if_collateralTokens_more_256()": FunctionFragment;
        "test_CM_53_addToken_adds_token_and_set_tokenMaskMap_correctly()": FunctionFragment;
        "test_CM_54_setLiquidationThreshold_reverts_for_unknown_token()": FunctionFragment;
        "test_CM_55_setForbidMask_sets_forbidMask_correctly()": FunctionFragment;
        "test_CM_56_changeContractAllowance_updates_adapterToContract()": FunctionFragment;
        "test_CM_57_upgradeContracts_updates_contracts_correctly()": FunctionFragment;
        "test_CM_58_setConfigurator_sets_creditConfigurator_correctly_and_emits_event()": FunctionFragment;
        "test_CM_59_getMaxIndex_works_properly(uint256)": FunctionFragment;
        "test_CM_60_universal_adapter_can_call_adapter_restricted_functions()": FunctionFragment;
        "test_CM_61_setMaxEnabledTokens_works_correctly()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "IS_TEST" | "failed" | "setUp" | "test_CM_01_constructor_sets_correct_values" | "test_CM_02_credit_account_management_functions_revert_if_not_called_by_creditFacadeCall" | "test_CM_03_credit_account_execution_functions_revert_if_not_called_by_creditFacade" | "test_CM_04_credit_account_configurator_functions_revert_if_not_called_by_creditFacade" | "test_CM_05_pause_pauses_management_functions" | "test_CM_06_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool" | "test_CM_07_openCreditAccount_reverts_if_zero_address_or_address_exists" | "test_CM_08_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool" | "test_CM_09_close_credit_account_returns_credit_account_and_remove_borrower_from_map" | "test_CM_10_close_credit_account_returns_underlying_token_if_not_liquidated" | "test_CM_11_close_credit_account_charges_caller_if_underlying_token_not_enough" | "test_CM_12_close_credit_account_charges_caller_if_underlying_token_not_enough" | "test_CM_13_close_credit_account_charges_caller_if_underlying_token_not_enough" | "test_CM_14_close_credit_account_with_nonzero_skipTokenMask_sends_correct_tokens" | "test_CM_16_close_weth_credit_account_sends_eth_to_borrower" | "test_CM_17_close_dai_credit_account_sends_eth_to_borrower" | "test_CM_18_close_credit_account_sends_eth_to_liquidator_and_weth_to_borrower" | "test_CM_19_close_dai_credit_account_sends_eth_to_liquidator" | "test_CM_20_manageDebt_correctly_increases_debt" | "test_CM_21_manageDebt_correctly_decreases_debt" | "test_CM_22_add_collateral_transfers_money_and_enables_token" | "test_CM_23_transferAccountOwnership_reverts_if_to_equals_zero_or_account_exists" | "test_CM_24_transferAccountOwnership_changes_creditAccounts_map_properly" | "test_CM_25A_approveCreditAccount_reverts_if_the_token_is_not_added" | "test_CM_25_approveCreditAccount_reverts_if_adapter_isnt_connected_with_contract_or_0" | "test_CM_26_approveCreditAccount_approves_with_desired_allowance" | "test_CM_27A_approveCreditAccount_works_for_ERC20_with_approve_restrictions" | "test_CM_27B_approveCreditAccount_works_for_ERC20_with_approve_restrictions" | "test_CM_28_executeOrder_reverts_if_adapter_is_not_connected_with_target_contract" | "test_CM_29_executeOrder_calls_credit_account_method_and_emit_event" | "test_CM_30_checkAndEnableToken_reverts_for_token_for_token_not_in_list_and_for_forbidden_token" | "test_CM_31_checkAndEnableToken_enables_token_for_creditAccount" | "test_CM_32_fastCollateralCheck_enables_tokenOut_and_reverts_if_its_unkown_or_forbidden" | "test_CM_33_fastCollateralCheck_disable_tokens_with_zero_balance" | "test_CM_34_fastCollateralCheck_is_passed_if_collateralOut_gte_collarteralIn" | "test_CM_35_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_gte_collarteralIn_wo_lt_check" | "test_CM_36A_fastCollateralCheck_correctly_optimizes_enabled_tokens" | "test_CM_36_fastCollateralCheck_is_passed_with_cumulative_drop_lte_feeLiquidation" | "test_CM_37_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_lt_collarteralIn_wo_lt_check" | "test_CM_38_fullCollateralCheck_skips_tokens_is_they_are_not_enabled" | "test_CM_39_fullCollateralCheck_diables_tokens_if_they_have_zero_balance" | "test_CM_40_fullCollateralCheck_breaks_loop_if_total_gte_borrowAmountPlusInterestRateUSD_and_pass_the_check" | "test_CM_41A_fullCollateralCheck_correctly_disables_the_underlying_when_needed" | "test_CM_41B_fullCollateralCheck_correctly_optimizes_enabled_tokens" | "test_CM_41_fullCollateralCheck_reverts_if_CA_has_more_than_allowed_enabled_tokens" | "test_CM_42_fullCollateralCheck_fuzzing_test" | "test_CM_43_calcClosePayments_test" | "test_CM_44_transferAssetsTo_sends_all_tokens_except_underlying_one_to_provided_address" | "test_CM_45_safeTokenTransfer_transfers_tokens" | "test_CM_46__disableToken_disabale_tokens_and_do_not_enable_it_if_called_twice" | "test_CM_47_collateralTokens_works_as_expected" | "test_CM_48_getCreditAccountOrRevert_reverts_if_borrower_has_no_account" | "test_CM_49_calcCreditAccountAccruedInterest_computes_correctly" | "test_CM_50_getCreditAccountParameters_return_correct_values" | "test_CM_51_setParams_sets_configuration_properly" | "test_CM_52_addToken_reverts_if_token_exists_and_if_collateralTokens_more_256" | "test_CM_53_addToken_adds_token_and_set_tokenMaskMap_correctly" | "test_CM_54_setLiquidationThreshold_reverts_for_unknown_token" | "test_CM_55_setForbidMask_sets_forbidMask_correctly" | "test_CM_56_changeContractAllowance_updates_adapterToContract" | "test_CM_57_upgradeContracts_updates_contracts_correctly" | "test_CM_58_setConfigurator_sets_creditConfigurator_correctly_and_emits_event" | "test_CM_59_getMaxIndex_works_properly" | "test_CM_60_universal_adapter_can_call_adapter_restricted_functions" | "test_CM_61_setMaxEnabledTokens_works_correctly"): FunctionFragment;
    encodeFunctionData(functionFragment: "IS_TEST", values?: undefined): string;
    encodeFunctionData(functionFragment: "failed", values?: undefined): string;
    encodeFunctionData(functionFragment: "setUp", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_01_constructor_sets_correct_values", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_02_credit_account_management_functions_revert_if_not_called_by_creditFacadeCall", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_03_credit_account_execution_functions_revert_if_not_called_by_creditFacade", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_04_credit_account_configurator_functions_revert_if_not_called_by_creditFacade", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_05_pause_pauses_management_functions", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_06_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_07_openCreditAccount_reverts_if_zero_address_or_address_exists", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_08_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_09_close_credit_account_returns_credit_account_and_remove_borrower_from_map", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_10_close_credit_account_returns_underlying_token_if_not_liquidated", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_11_close_credit_account_charges_caller_if_underlying_token_not_enough", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_12_close_credit_account_charges_caller_if_underlying_token_not_enough", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_13_close_credit_account_charges_caller_if_underlying_token_not_enough", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_14_close_credit_account_with_nonzero_skipTokenMask_sends_correct_tokens", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_16_close_weth_credit_account_sends_eth_to_borrower", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_17_close_dai_credit_account_sends_eth_to_borrower", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_18_close_credit_account_sends_eth_to_liquidator_and_weth_to_borrower", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_19_close_dai_credit_account_sends_eth_to_liquidator", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_20_manageDebt_correctly_increases_debt", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "test_CM_21_manageDebt_correctly_decreases_debt", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "test_CM_22_add_collateral_transfers_money_and_enables_token", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_23_transferAccountOwnership_reverts_if_to_equals_zero_or_account_exists", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_24_transferAccountOwnership_changes_creditAccounts_map_properly", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_25A_approveCreditAccount_reverts_if_the_token_is_not_added", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_25_approveCreditAccount_reverts_if_adapter_isnt_connected_with_contract_or_0", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_26_approveCreditAccount_approves_with_desired_allowance", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_27A_approveCreditAccount_works_for_ERC20_with_approve_restrictions", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_27B_approveCreditAccount_works_for_ERC20_with_approve_restrictions", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_28_executeOrder_reverts_if_adapter_is_not_connected_with_target_contract", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_29_executeOrder_calls_credit_account_method_and_emit_event", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_30_checkAndEnableToken_reverts_for_token_for_token_not_in_list_and_for_forbidden_token", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_31_checkAndEnableToken_enables_token_for_creditAccount", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_32_fastCollateralCheck_enables_tokenOut_and_reverts_if_its_unkown_or_forbidden", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_33_fastCollateralCheck_disable_tokens_with_zero_balance", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "test_CM_34_fastCollateralCheck_is_passed_if_collateralOut_gte_collarteralIn", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_35_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_gte_collarteralIn_wo_lt_check", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_36A_fastCollateralCheck_correctly_optimizes_enabled_tokens", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_36_fastCollateralCheck_is_passed_with_cumulative_drop_lte_feeLiquidation", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "test_CM_37_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_lt_collarteralIn_wo_lt_check", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_38_fullCollateralCheck_skips_tokens_is_they_are_not_enabled", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_39_fullCollateralCheck_diables_tokens_if_they_have_zero_balance", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_40_fullCollateralCheck_breaks_loop_if_total_gte_borrowAmountPlusInterestRateUSD_and_pass_the_check", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_41A_fullCollateralCheck_correctly_disables_the_underlying_when_needed", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_41B_fullCollateralCheck_correctly_optimizes_enabled_tokens", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_41_fullCollateralCheck_reverts_if_CA_has_more_than_allowed_enabled_tokens", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_42_fullCollateralCheck_fuzzing_test", values: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        boolean,
        boolean,
        boolean
    ]): string;
    encodeFunctionData(functionFragment: "test_CM_43_calcClosePayments_test", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_44_transferAssetsTo_sends_all_tokens_except_underlying_one_to_provided_address", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_45_safeTokenTransfer_transfers_tokens", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_46__disableToken_disabale_tokens_and_do_not_enable_it_if_called_twice", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_47_collateralTokens_works_as_expected", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "test_CM_48_getCreditAccountOrRevert_reverts_if_borrower_has_no_account", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_49_calcCreditAccountAccruedInterest_computes_correctly", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "test_CM_50_getCreditAccountParameters_return_correct_values", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_51_setParams_sets_configuration_properly", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_52_addToken_reverts_if_token_exists_and_if_collateralTokens_more_256", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_53_addToken_adds_token_and_set_tokenMaskMap_correctly", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_54_setLiquidationThreshold_reverts_for_unknown_token", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_55_setForbidMask_sets_forbidMask_correctly", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_56_changeContractAllowance_updates_adapterToContract", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_57_upgradeContracts_updates_contracts_correctly", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_58_setConfigurator_sets_creditConfigurator_correctly_and_emits_event", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_59_getMaxIndex_works_properly", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "test_CM_60_universal_adapter_can_call_adapter_restricted_functions", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CM_61_setMaxEnabledTokens_works_correctly", values?: undefined): string;
    decodeFunctionResult(functionFragment: "IS_TEST", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "failed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setUp", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_01_constructor_sets_correct_values", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_02_credit_account_management_functions_revert_if_not_called_by_creditFacadeCall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_03_credit_account_execution_functions_revert_if_not_called_by_creditFacade", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_04_credit_account_configurator_functions_revert_if_not_called_by_creditFacade", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_05_pause_pauses_management_functions", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_06_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_07_openCreditAccount_reverts_if_zero_address_or_address_exists", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_08_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_09_close_credit_account_returns_credit_account_and_remove_borrower_from_map", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_10_close_credit_account_returns_underlying_token_if_not_liquidated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_11_close_credit_account_charges_caller_if_underlying_token_not_enough", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_12_close_credit_account_charges_caller_if_underlying_token_not_enough", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_13_close_credit_account_charges_caller_if_underlying_token_not_enough", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_14_close_credit_account_with_nonzero_skipTokenMask_sends_correct_tokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_16_close_weth_credit_account_sends_eth_to_borrower", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_17_close_dai_credit_account_sends_eth_to_borrower", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_18_close_credit_account_sends_eth_to_liquidator_and_weth_to_borrower", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_19_close_dai_credit_account_sends_eth_to_liquidator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_20_manageDebt_correctly_increases_debt", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_21_manageDebt_correctly_decreases_debt", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_22_add_collateral_transfers_money_and_enables_token", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_23_transferAccountOwnership_reverts_if_to_equals_zero_or_account_exists", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_24_transferAccountOwnership_changes_creditAccounts_map_properly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_25A_approveCreditAccount_reverts_if_the_token_is_not_added", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_25_approveCreditAccount_reverts_if_adapter_isnt_connected_with_contract_or_0", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_26_approveCreditAccount_approves_with_desired_allowance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_27A_approveCreditAccount_works_for_ERC20_with_approve_restrictions", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_27B_approveCreditAccount_works_for_ERC20_with_approve_restrictions", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_28_executeOrder_reverts_if_adapter_is_not_connected_with_target_contract", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_29_executeOrder_calls_credit_account_method_and_emit_event", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_30_checkAndEnableToken_reverts_for_token_for_token_not_in_list_and_for_forbidden_token", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_31_checkAndEnableToken_enables_token_for_creditAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_32_fastCollateralCheck_enables_tokenOut_and_reverts_if_its_unkown_or_forbidden", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_33_fastCollateralCheck_disable_tokens_with_zero_balance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_34_fastCollateralCheck_is_passed_if_collateralOut_gte_collarteralIn", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_35_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_gte_collarteralIn_wo_lt_check", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_36A_fastCollateralCheck_correctly_optimizes_enabled_tokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_36_fastCollateralCheck_is_passed_with_cumulative_drop_lte_feeLiquidation", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_37_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_lt_collarteralIn_wo_lt_check", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_38_fullCollateralCheck_skips_tokens_is_they_are_not_enabled", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_39_fullCollateralCheck_diables_tokens_if_they_have_zero_balance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_40_fullCollateralCheck_breaks_loop_if_total_gte_borrowAmountPlusInterestRateUSD_and_pass_the_check", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_41A_fullCollateralCheck_correctly_disables_the_underlying_when_needed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_41B_fullCollateralCheck_correctly_optimizes_enabled_tokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_41_fullCollateralCheck_reverts_if_CA_has_more_than_allowed_enabled_tokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_42_fullCollateralCheck_fuzzing_test", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_43_calcClosePayments_test", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_44_transferAssetsTo_sends_all_tokens_except_underlying_one_to_provided_address", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_45_safeTokenTransfer_transfers_tokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_46__disableToken_disabale_tokens_and_do_not_enable_it_if_called_twice", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_47_collateralTokens_works_as_expected", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_48_getCreditAccountOrRevert_reverts_if_borrower_has_no_account", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_49_calcCreditAccountAccruedInterest_computes_correctly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_50_getCreditAccountParameters_return_correct_values", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_51_setParams_sets_configuration_properly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_52_addToken_reverts_if_token_exists_and_if_collateralTokens_more_256", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_53_addToken_adds_token_and_set_tokenMaskMap_correctly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_54_setLiquidationThreshold_reverts_for_unknown_token", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_55_setForbidMask_sets_forbidMask_correctly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_56_changeContractAllowance_updates_adapterToContract", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_57_upgradeContracts_updates_contracts_correctly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_58_setConfigurator_sets_creditConfigurator_correctly_and_emits_event", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_59_getMaxIndex_works_properly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_60_universal_adapter_can_call_adapter_restricted_functions", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CM_61_setMaxEnabledTokens_works_correctly", data: BytesLike): Result;
    events: {
        "ExecuteOrder(address,address)": EventFragment;
        "NewConfigurator(address)": EventFragment;
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
    getEvent(nameOrSignatureOrTopic: "ExecuteOrder"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewConfigurator"): EventFragment;
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
export interface ExecuteOrderEventObject {
    borrower: string;
    target: string;
}
export declare type ExecuteOrderEvent = TypedEvent<[
    string,
    string
], ExecuteOrderEventObject>;
export declare type ExecuteOrderEventFilter = TypedEventFilter<ExecuteOrderEvent>;
export interface NewConfiguratorEventObject {
    newConfigurator: string;
}
export declare type NewConfiguratorEvent = TypedEvent<[
    string
], NewConfiguratorEventObject>;
export declare type NewConfiguratorEventFilter = TypedEventFilter<NewConfiguratorEvent>;
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
export interface CreditManagerTest extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: CreditManagerTestInterface;
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
        failed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_01_constructor_sets_correct_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_02_credit_account_management_functions_revert_if_not_called_by_creditFacadeCall(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_03_credit_account_execution_functions_revert_if_not_called_by_creditFacade(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_04_credit_account_configurator_functions_revert_if_not_called_by_creditFacade(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_05_pause_pauses_management_functions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_06_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_07_openCreditAccount_reverts_if_zero_address_or_address_exists(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_08_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_09_close_credit_account_returns_credit_account_and_remove_borrower_from_map(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_10_close_credit_account_returns_underlying_token_if_not_liquidated(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_11_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_12_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_13_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_14_close_credit_account_with_nonzero_skipTokenMask_sends_correct_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_16_close_weth_credit_account_sends_eth_to_borrower(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_17_close_dai_credit_account_sends_eth_to_borrower(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_18_close_credit_account_sends_eth_to_liquidator_and_weth_to_borrower(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_19_close_dai_credit_account_sends_eth_to_liquidator(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_20_manageDebt_correctly_increases_debt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_21_manageDebt_correctly_decreases_debt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_22_add_collateral_transfers_money_and_enables_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_23_transferAccountOwnership_reverts_if_to_equals_zero_or_account_exists(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_24_transferAccountOwnership_changes_creditAccounts_map_properly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_25A_approveCreditAccount_reverts_if_the_token_is_not_added(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_25_approveCreditAccount_reverts_if_adapter_isnt_connected_with_contract_or_0(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_26_approveCreditAccount_approves_with_desired_allowance(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_27A_approveCreditAccount_works_for_ERC20_with_approve_restrictions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_27B_approveCreditAccount_works_for_ERC20_with_approve_restrictions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_28_executeOrder_reverts_if_adapter_is_not_connected_with_target_contract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_29_executeOrder_calls_credit_account_method_and_emit_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_30_checkAndEnableToken_reverts_for_token_for_token_not_in_list_and_for_forbidden_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_31_checkAndEnableToken_enables_token_for_creditAccount(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_32_fastCollateralCheck_enables_tokenOut_and_reverts_if_its_unkown_or_forbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_33_fastCollateralCheck_disable_tokens_with_zero_balance(balanceAfter: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_34_fastCollateralCheck_is_passed_if_collateralOut_gte_collarteralIn(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_35_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_gte_collarteralIn_wo_lt_check(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_36A_fastCollateralCheck_correctly_optimizes_enabled_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_36_fastCollateralCheck_is_passed_with_cumulative_drop_lte_feeLiquidation(desiredDrop: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_37_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_lt_collarteralIn_wo_lt_check(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_38_fullCollateralCheck_skips_tokens_is_they_are_not_enabled(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_39_fullCollateralCheck_diables_tokens_if_they_have_zero_balance(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_40_fullCollateralCheck_breaks_loop_if_total_gte_borrowAmountPlusInterestRateUSD_and_pass_the_check(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_41A_fullCollateralCheck_correctly_disables_the_underlying_when_needed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_41B_fullCollateralCheck_correctly_optimizes_enabled_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_41_fullCollateralCheck_reverts_if_CA_has_more_than_allowed_enabled_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_42_fullCollateralCheck_fuzzing_test(borrowedAmount: BigNumberish, daiBalance: BigNumberish, usdcBalance: BigNumberish, linkBalance: BigNumberish, wethBalance: BigNumberish, enableUSDC: boolean, enableLINK: boolean, enableWETH: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_43_calcClosePayments_test(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_44_transferAssetsTo_sends_all_tokens_except_underlying_one_to_provided_address(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_45_safeTokenTransfer_transfers_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_46__disableToken_disabale_tokens_and_do_not_enable_it_if_called_twice(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_47_collateralTokens_works_as_expected(newToken: string, newLT: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_48_getCreditAccountOrRevert_reverts_if_borrower_has_no_account(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_49_calcCreditAccountAccruedInterest_computes_correctly(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_50_getCreditAccountParameters_return_correct_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_51_setParams_sets_configuration_properly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_52_addToken_reverts_if_token_exists_and_if_collateralTokens_more_256(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_53_addToken_adds_token_and_set_tokenMaskMap_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_54_setLiquidationThreshold_reverts_for_unknown_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_55_setForbidMask_sets_forbidMask_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_56_changeContractAllowance_updates_adapterToContract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_57_upgradeContracts_updates_contracts_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_58_setConfigurator_sets_creditConfigurator_correctly_and_emits_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_59_getMaxIndex_works_properly(noise: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_60_universal_adapter_can_call_adapter_restricted_functions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CM_61_setMaxEnabledTokens_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
    };
    IS_TEST(overrides?: CallOverrides): Promise<boolean>;
    failed(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    setUp(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_01_constructor_sets_correct_values(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_02_credit_account_management_functions_revert_if_not_called_by_creditFacadeCall(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_03_credit_account_execution_functions_revert_if_not_called_by_creditFacade(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_04_credit_account_configurator_functions_revert_if_not_called_by_creditFacade(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_05_pause_pauses_management_functions(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_06_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_07_openCreditAccount_reverts_if_zero_address_or_address_exists(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_08_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_09_close_credit_account_returns_credit_account_and_remove_borrower_from_map(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_10_close_credit_account_returns_underlying_token_if_not_liquidated(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_11_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_12_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_13_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_14_close_credit_account_with_nonzero_skipTokenMask_sends_correct_tokens(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_16_close_weth_credit_account_sends_eth_to_borrower(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_17_close_dai_credit_account_sends_eth_to_borrower(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_18_close_credit_account_sends_eth_to_liquidator_and_weth_to_borrower(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_19_close_dai_credit_account_sends_eth_to_liquidator(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_20_manageDebt_correctly_increases_debt(amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_21_manageDebt_correctly_decreases_debt(amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_22_add_collateral_transfers_money_and_enables_token(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_23_transferAccountOwnership_reverts_if_to_equals_zero_or_account_exists(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_24_transferAccountOwnership_changes_creditAccounts_map_properly(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_25A_approveCreditAccount_reverts_if_the_token_is_not_added(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_25_approveCreditAccount_reverts_if_adapter_isnt_connected_with_contract_or_0(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_26_approveCreditAccount_approves_with_desired_allowance(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_27A_approveCreditAccount_works_for_ERC20_with_approve_restrictions(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_27B_approveCreditAccount_works_for_ERC20_with_approve_restrictions(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_28_executeOrder_reverts_if_adapter_is_not_connected_with_target_contract(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_29_executeOrder_calls_credit_account_method_and_emit_event(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_30_checkAndEnableToken_reverts_for_token_for_token_not_in_list_and_for_forbidden_token(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_31_checkAndEnableToken_enables_token_for_creditAccount(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_32_fastCollateralCheck_enables_tokenOut_and_reverts_if_its_unkown_or_forbidden(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_33_fastCollateralCheck_disable_tokens_with_zero_balance(balanceAfter: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_34_fastCollateralCheck_is_passed_if_collateralOut_gte_collarteralIn(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_35_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_gte_collarteralIn_wo_lt_check(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_36A_fastCollateralCheck_correctly_optimizes_enabled_tokens(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_36_fastCollateralCheck_is_passed_with_cumulative_drop_lte_feeLiquidation(desiredDrop: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_37_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_lt_collarteralIn_wo_lt_check(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_38_fullCollateralCheck_skips_tokens_is_they_are_not_enabled(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_39_fullCollateralCheck_diables_tokens_if_they_have_zero_balance(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_40_fullCollateralCheck_breaks_loop_if_total_gte_borrowAmountPlusInterestRateUSD_and_pass_the_check(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_41A_fullCollateralCheck_correctly_disables_the_underlying_when_needed(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_41B_fullCollateralCheck_correctly_optimizes_enabled_tokens(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_41_fullCollateralCheck_reverts_if_CA_has_more_than_allowed_enabled_tokens(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_42_fullCollateralCheck_fuzzing_test(borrowedAmount: BigNumberish, daiBalance: BigNumberish, usdcBalance: BigNumberish, linkBalance: BigNumberish, wethBalance: BigNumberish, enableUSDC: boolean, enableLINK: boolean, enableWETH: boolean, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_43_calcClosePayments_test(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_44_transferAssetsTo_sends_all_tokens_except_underlying_one_to_provided_address(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_45_safeTokenTransfer_transfers_tokens(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_46__disableToken_disabale_tokens_and_do_not_enable_it_if_called_twice(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_47_collateralTokens_works_as_expected(newToken: string, newLT: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_48_getCreditAccountOrRevert_reverts_if_borrower_has_no_account(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_49_calcCreditAccountAccruedInterest_computes_correctly(amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_50_getCreditAccountParameters_return_correct_values(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_51_setParams_sets_configuration_properly(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_52_addToken_reverts_if_token_exists_and_if_collateralTokens_more_256(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_53_addToken_adds_token_and_set_tokenMaskMap_correctly(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_54_setLiquidationThreshold_reverts_for_unknown_token(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_55_setForbidMask_sets_forbidMask_correctly(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_56_changeContractAllowance_updates_adapterToContract(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_57_upgradeContracts_updates_contracts_correctly(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_58_setConfigurator_sets_creditConfigurator_correctly_and_emits_event(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_59_getMaxIndex_works_properly(noise: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_60_universal_adapter_can_call_adapter_restricted_functions(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CM_61_setMaxEnabledTokens_works_correctly(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        IS_TEST(overrides?: CallOverrides): Promise<boolean>;
        failed(overrides?: CallOverrides): Promise<boolean>;
        setUp(overrides?: CallOverrides): Promise<void>;
        test_CM_01_constructor_sets_correct_values(overrides?: CallOverrides): Promise<void>;
        test_CM_02_credit_account_management_functions_revert_if_not_called_by_creditFacadeCall(overrides?: CallOverrides): Promise<void>;
        test_CM_03_credit_account_execution_functions_revert_if_not_called_by_creditFacade(overrides?: CallOverrides): Promise<void>;
        test_CM_04_credit_account_configurator_functions_revert_if_not_called_by_creditFacade(overrides?: CallOverrides): Promise<void>;
        test_CM_05_pause_pauses_management_functions(overrides?: CallOverrides): Promise<void>;
        test_CM_06_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool(overrides?: CallOverrides): Promise<void>;
        test_CM_07_openCreditAccount_reverts_if_zero_address_or_address_exists(overrides?: CallOverrides): Promise<void>;
        test_CM_08_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool(overrides?: CallOverrides): Promise<void>;
        test_CM_09_close_credit_account_returns_credit_account_and_remove_borrower_from_map(overrides?: CallOverrides): Promise<void>;
        test_CM_10_close_credit_account_returns_underlying_token_if_not_liquidated(overrides?: CallOverrides): Promise<void>;
        test_CM_11_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: CallOverrides): Promise<void>;
        test_CM_12_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: CallOverrides): Promise<void>;
        test_CM_13_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: CallOverrides): Promise<void>;
        test_CM_14_close_credit_account_with_nonzero_skipTokenMask_sends_correct_tokens(overrides?: CallOverrides): Promise<void>;
        test_CM_16_close_weth_credit_account_sends_eth_to_borrower(overrides?: CallOverrides): Promise<void>;
        test_CM_17_close_dai_credit_account_sends_eth_to_borrower(overrides?: CallOverrides): Promise<void>;
        test_CM_18_close_credit_account_sends_eth_to_liquidator_and_weth_to_borrower(overrides?: CallOverrides): Promise<void>;
        test_CM_19_close_dai_credit_account_sends_eth_to_liquidator(overrides?: CallOverrides): Promise<void>;
        test_CM_20_manageDebt_correctly_increases_debt(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        test_CM_21_manageDebt_correctly_decreases_debt(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        test_CM_22_add_collateral_transfers_money_and_enables_token(overrides?: CallOverrides): Promise<void>;
        test_CM_23_transferAccountOwnership_reverts_if_to_equals_zero_or_account_exists(overrides?: CallOverrides): Promise<void>;
        test_CM_24_transferAccountOwnership_changes_creditAccounts_map_properly(overrides?: CallOverrides): Promise<void>;
        test_CM_25A_approveCreditAccount_reverts_if_the_token_is_not_added(overrides?: CallOverrides): Promise<void>;
        test_CM_25_approveCreditAccount_reverts_if_adapter_isnt_connected_with_contract_or_0(overrides?: CallOverrides): Promise<void>;
        test_CM_26_approveCreditAccount_approves_with_desired_allowance(overrides?: CallOverrides): Promise<void>;
        test_CM_27A_approveCreditAccount_works_for_ERC20_with_approve_restrictions(overrides?: CallOverrides): Promise<void>;
        test_CM_27B_approveCreditAccount_works_for_ERC20_with_approve_restrictions(overrides?: CallOverrides): Promise<void>;
        test_CM_28_executeOrder_reverts_if_adapter_is_not_connected_with_target_contract(overrides?: CallOverrides): Promise<void>;
        test_CM_29_executeOrder_calls_credit_account_method_and_emit_event(overrides?: CallOverrides): Promise<void>;
        test_CM_30_checkAndEnableToken_reverts_for_token_for_token_not_in_list_and_for_forbidden_token(overrides?: CallOverrides): Promise<void>;
        test_CM_31_checkAndEnableToken_enables_token_for_creditAccount(overrides?: CallOverrides): Promise<void>;
        test_CM_32_fastCollateralCheck_enables_tokenOut_and_reverts_if_its_unkown_or_forbidden(overrides?: CallOverrides): Promise<void>;
        test_CM_33_fastCollateralCheck_disable_tokens_with_zero_balance(balanceAfter: BigNumberish, overrides?: CallOverrides): Promise<void>;
        test_CM_34_fastCollateralCheck_is_passed_if_collateralOut_gte_collarteralIn(overrides?: CallOverrides): Promise<void>;
        test_CM_35_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_gte_collarteralIn_wo_lt_check(overrides?: CallOverrides): Promise<void>;
        test_CM_36A_fastCollateralCheck_correctly_optimizes_enabled_tokens(overrides?: CallOverrides): Promise<void>;
        test_CM_36_fastCollateralCheck_is_passed_with_cumulative_drop_lte_feeLiquidation(desiredDrop: BigNumberish, overrides?: CallOverrides): Promise<void>;
        test_CM_37_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_lt_collarteralIn_wo_lt_check(overrides?: CallOverrides): Promise<void>;
        test_CM_38_fullCollateralCheck_skips_tokens_is_they_are_not_enabled(overrides?: CallOverrides): Promise<void>;
        test_CM_39_fullCollateralCheck_diables_tokens_if_they_have_zero_balance(overrides?: CallOverrides): Promise<void>;
        test_CM_40_fullCollateralCheck_breaks_loop_if_total_gte_borrowAmountPlusInterestRateUSD_and_pass_the_check(overrides?: CallOverrides): Promise<void>;
        test_CM_41A_fullCollateralCheck_correctly_disables_the_underlying_when_needed(overrides?: CallOverrides): Promise<void>;
        test_CM_41B_fullCollateralCheck_correctly_optimizes_enabled_tokens(overrides?: CallOverrides): Promise<void>;
        test_CM_41_fullCollateralCheck_reverts_if_CA_has_more_than_allowed_enabled_tokens(overrides?: CallOverrides): Promise<void>;
        test_CM_42_fullCollateralCheck_fuzzing_test(borrowedAmount: BigNumberish, daiBalance: BigNumberish, usdcBalance: BigNumberish, linkBalance: BigNumberish, wethBalance: BigNumberish, enableUSDC: boolean, enableLINK: boolean, enableWETH: boolean, overrides?: CallOverrides): Promise<void>;
        test_CM_43_calcClosePayments_test(overrides?: CallOverrides): Promise<void>;
        test_CM_44_transferAssetsTo_sends_all_tokens_except_underlying_one_to_provided_address(overrides?: CallOverrides): Promise<void>;
        test_CM_45_safeTokenTransfer_transfers_tokens(overrides?: CallOverrides): Promise<void>;
        test_CM_46__disableToken_disabale_tokens_and_do_not_enable_it_if_called_twice(overrides?: CallOverrides): Promise<void>;
        test_CM_47_collateralTokens_works_as_expected(newToken: string, newLT: BigNumberish, overrides?: CallOverrides): Promise<void>;
        test_CM_48_getCreditAccountOrRevert_reverts_if_borrower_has_no_account(overrides?: CallOverrides): Promise<void>;
        test_CM_49_calcCreditAccountAccruedInterest_computes_correctly(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        test_CM_50_getCreditAccountParameters_return_correct_values(overrides?: CallOverrides): Promise<void>;
        test_CM_51_setParams_sets_configuration_properly(overrides?: CallOverrides): Promise<void>;
        test_CM_52_addToken_reverts_if_token_exists_and_if_collateralTokens_more_256(overrides?: CallOverrides): Promise<void>;
        test_CM_53_addToken_adds_token_and_set_tokenMaskMap_correctly(overrides?: CallOverrides): Promise<void>;
        test_CM_54_setLiquidationThreshold_reverts_for_unknown_token(overrides?: CallOverrides): Promise<void>;
        test_CM_55_setForbidMask_sets_forbidMask_correctly(overrides?: CallOverrides): Promise<void>;
        test_CM_56_changeContractAllowance_updates_adapterToContract(overrides?: CallOverrides): Promise<void>;
        test_CM_57_upgradeContracts_updates_contracts_correctly(overrides?: CallOverrides): Promise<void>;
        test_CM_58_setConfigurator_sets_creditConfigurator_correctly_and_emits_event(overrides?: CallOverrides): Promise<void>;
        test_CM_59_getMaxIndex_works_properly(noise: BigNumberish, overrides?: CallOverrides): Promise<void>;
        test_CM_60_universal_adapter_can_call_adapter_restricted_functions(overrides?: CallOverrides): Promise<void>;
        test_CM_61_setMaxEnabledTokens_works_correctly(overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "ExecuteOrder(address,address)"(borrower?: string | null, target?: string | null): ExecuteOrderEventFilter;
        ExecuteOrder(borrower?: string | null, target?: string | null): ExecuteOrderEventFilter;
        "NewConfigurator(address)"(newConfigurator?: string | null): NewConfiguratorEventFilter;
        NewConfigurator(newConfigurator?: string | null): NewConfiguratorEventFilter;
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
        failed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_01_constructor_sets_correct_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_02_credit_account_management_functions_revert_if_not_called_by_creditFacadeCall(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_03_credit_account_execution_functions_revert_if_not_called_by_creditFacade(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_04_credit_account_configurator_functions_revert_if_not_called_by_creditFacade(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_05_pause_pauses_management_functions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_06_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_07_openCreditAccount_reverts_if_zero_address_or_address_exists(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_08_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_09_close_credit_account_returns_credit_account_and_remove_borrower_from_map(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_10_close_credit_account_returns_underlying_token_if_not_liquidated(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_11_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_12_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_13_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_14_close_credit_account_with_nonzero_skipTokenMask_sends_correct_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_16_close_weth_credit_account_sends_eth_to_borrower(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_17_close_dai_credit_account_sends_eth_to_borrower(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_18_close_credit_account_sends_eth_to_liquidator_and_weth_to_borrower(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_19_close_dai_credit_account_sends_eth_to_liquidator(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_20_manageDebt_correctly_increases_debt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_21_manageDebt_correctly_decreases_debt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_22_add_collateral_transfers_money_and_enables_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_23_transferAccountOwnership_reverts_if_to_equals_zero_or_account_exists(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_24_transferAccountOwnership_changes_creditAccounts_map_properly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_25A_approveCreditAccount_reverts_if_the_token_is_not_added(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_25_approveCreditAccount_reverts_if_adapter_isnt_connected_with_contract_or_0(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_26_approveCreditAccount_approves_with_desired_allowance(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_27A_approveCreditAccount_works_for_ERC20_with_approve_restrictions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_27B_approveCreditAccount_works_for_ERC20_with_approve_restrictions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_28_executeOrder_reverts_if_adapter_is_not_connected_with_target_contract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_29_executeOrder_calls_credit_account_method_and_emit_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_30_checkAndEnableToken_reverts_for_token_for_token_not_in_list_and_for_forbidden_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_31_checkAndEnableToken_enables_token_for_creditAccount(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_32_fastCollateralCheck_enables_tokenOut_and_reverts_if_its_unkown_or_forbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_33_fastCollateralCheck_disable_tokens_with_zero_balance(balanceAfter: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_34_fastCollateralCheck_is_passed_if_collateralOut_gte_collarteralIn(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_35_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_gte_collarteralIn_wo_lt_check(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_36A_fastCollateralCheck_correctly_optimizes_enabled_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_36_fastCollateralCheck_is_passed_with_cumulative_drop_lte_feeLiquidation(desiredDrop: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_37_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_lt_collarteralIn_wo_lt_check(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_38_fullCollateralCheck_skips_tokens_is_they_are_not_enabled(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_39_fullCollateralCheck_diables_tokens_if_they_have_zero_balance(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_40_fullCollateralCheck_breaks_loop_if_total_gte_borrowAmountPlusInterestRateUSD_and_pass_the_check(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_41A_fullCollateralCheck_correctly_disables_the_underlying_when_needed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_41B_fullCollateralCheck_correctly_optimizes_enabled_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_41_fullCollateralCheck_reverts_if_CA_has_more_than_allowed_enabled_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_42_fullCollateralCheck_fuzzing_test(borrowedAmount: BigNumberish, daiBalance: BigNumberish, usdcBalance: BigNumberish, linkBalance: BigNumberish, wethBalance: BigNumberish, enableUSDC: boolean, enableLINK: boolean, enableWETH: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_43_calcClosePayments_test(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_44_transferAssetsTo_sends_all_tokens_except_underlying_one_to_provided_address(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_45_safeTokenTransfer_transfers_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_46__disableToken_disabale_tokens_and_do_not_enable_it_if_called_twice(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_47_collateralTokens_works_as_expected(newToken: string, newLT: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_48_getCreditAccountOrRevert_reverts_if_borrower_has_no_account(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_49_calcCreditAccountAccruedInterest_computes_correctly(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_50_getCreditAccountParameters_return_correct_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_51_setParams_sets_configuration_properly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_52_addToken_reverts_if_token_exists_and_if_collateralTokens_more_256(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_53_addToken_adds_token_and_set_tokenMaskMap_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_54_setLiquidationThreshold_reverts_for_unknown_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_55_setForbidMask_sets_forbidMask_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_56_changeContractAllowance_updates_adapterToContract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_57_upgradeContracts_updates_contracts_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_58_setConfigurator_sets_creditConfigurator_correctly_and_emits_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_59_getMaxIndex_works_properly(noise: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_60_universal_adapter_can_call_adapter_restricted_functions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CM_61_setMaxEnabledTokens_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        IS_TEST(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        failed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_01_constructor_sets_correct_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_02_credit_account_management_functions_revert_if_not_called_by_creditFacadeCall(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_03_credit_account_execution_functions_revert_if_not_called_by_creditFacade(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_04_credit_account_configurator_functions_revert_if_not_called_by_creditFacade(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_05_pause_pauses_management_functions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_06_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_07_openCreditAccount_reverts_if_zero_address_or_address_exists(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_08_openCreditAccount_sets_correct_values_and_transfers_tokens_from_pool(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_09_close_credit_account_returns_credit_account_and_remove_borrower_from_map(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_10_close_credit_account_returns_underlying_token_if_not_liquidated(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_11_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_12_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_13_close_credit_account_charges_caller_if_underlying_token_not_enough(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_14_close_credit_account_with_nonzero_skipTokenMask_sends_correct_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_16_close_weth_credit_account_sends_eth_to_borrower(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_17_close_dai_credit_account_sends_eth_to_borrower(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_18_close_credit_account_sends_eth_to_liquidator_and_weth_to_borrower(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_19_close_dai_credit_account_sends_eth_to_liquidator(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_20_manageDebt_correctly_increases_debt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_21_manageDebt_correctly_decreases_debt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_22_add_collateral_transfers_money_and_enables_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_23_transferAccountOwnership_reverts_if_to_equals_zero_or_account_exists(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_24_transferAccountOwnership_changes_creditAccounts_map_properly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_25A_approveCreditAccount_reverts_if_the_token_is_not_added(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_25_approveCreditAccount_reverts_if_adapter_isnt_connected_with_contract_or_0(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_26_approveCreditAccount_approves_with_desired_allowance(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_27A_approveCreditAccount_works_for_ERC20_with_approve_restrictions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_27B_approveCreditAccount_works_for_ERC20_with_approve_restrictions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_28_executeOrder_reverts_if_adapter_is_not_connected_with_target_contract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_29_executeOrder_calls_credit_account_method_and_emit_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_30_checkAndEnableToken_reverts_for_token_for_token_not_in_list_and_for_forbidden_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_31_checkAndEnableToken_enables_token_for_creditAccount(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_32_fastCollateralCheck_enables_tokenOut_and_reverts_if_its_unkown_or_forbidden(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_33_fastCollateralCheck_disable_tokens_with_zero_balance(balanceAfter: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_34_fastCollateralCheck_is_passed_if_collateralOut_gte_collarteralIn(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_35_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_gte_collarteralIn_wo_lt_check(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_36A_fastCollateralCheck_correctly_optimizes_enabled_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_36_fastCollateralCheck_is_passed_with_cumulative_drop_lte_feeLiquidation(desiredDrop: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_37_fastCollateralCheck_reverts_if_more_enabled_tokens_than_allowed_if_collateralOut_lt_collarteralIn_wo_lt_check(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_38_fullCollateralCheck_skips_tokens_is_they_are_not_enabled(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_39_fullCollateralCheck_diables_tokens_if_they_have_zero_balance(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_40_fullCollateralCheck_breaks_loop_if_total_gte_borrowAmountPlusInterestRateUSD_and_pass_the_check(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_41A_fullCollateralCheck_correctly_disables_the_underlying_when_needed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_41B_fullCollateralCheck_correctly_optimizes_enabled_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_41_fullCollateralCheck_reverts_if_CA_has_more_than_allowed_enabled_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_42_fullCollateralCheck_fuzzing_test(borrowedAmount: BigNumberish, daiBalance: BigNumberish, usdcBalance: BigNumberish, linkBalance: BigNumberish, wethBalance: BigNumberish, enableUSDC: boolean, enableLINK: boolean, enableWETH: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_43_calcClosePayments_test(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_44_transferAssetsTo_sends_all_tokens_except_underlying_one_to_provided_address(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_45_safeTokenTransfer_transfers_tokens(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_46__disableToken_disabale_tokens_and_do_not_enable_it_if_called_twice(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_47_collateralTokens_works_as_expected(newToken: string, newLT: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_48_getCreditAccountOrRevert_reverts_if_borrower_has_no_account(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_49_calcCreditAccountAccruedInterest_computes_correctly(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_50_getCreditAccountParameters_return_correct_values(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_51_setParams_sets_configuration_properly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_52_addToken_reverts_if_token_exists_and_if_collateralTokens_more_256(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_53_addToken_adds_token_and_set_tokenMaskMap_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_54_setLiquidationThreshold_reverts_for_unknown_token(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_55_setForbidMask_sets_forbidMask_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_56_changeContractAllowance_updates_adapterToContract(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_57_upgradeContracts_updates_contracts_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_58_setConfigurator_sets_creditConfigurator_correctly_and_emits_event(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_59_getMaxIndex_works_properly(noise: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_60_universal_adapter_can_call_adapter_restricted_functions(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CM_61_setMaxEnabledTokens_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
    };
}
