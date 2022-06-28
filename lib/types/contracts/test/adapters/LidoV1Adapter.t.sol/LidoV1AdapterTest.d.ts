import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface LidoV1AdapterTestInterface extends utils.Interface {
    functions: {
        "IS_TEST()": FunctionFragment;
        "cft()": FunctionFragment;
        "creditConfigurator()": FunctionFragment;
        "creditFacade()": FunctionFragment;
        "creditManager()": FunctionFragment;
        "failed()": FunctionFragment;
        "lidoV1Adapter()": FunctionFragment;
        "lidoV1Gateway()": FunctionFragment;
        "lidoV1Mock()": FunctionFragment;
        "setUp()": FunctionFragment;
        "test_LDOV1_01_constructor_sets_correct_params()": FunctionFragment;
        "test_LDOV1_02_submit_and_submitAll_reverts_if_user_has_no_account()": FunctionFragment;
        "test_LDOV1_03_submit_works_correctly()": FunctionFragment;
        "test_LDOV1_04_submitAll_works_correctly()": FunctionFragment;
        "test_LDOV1_05_submit_updates_limit_and_reverts_on_limit_exceeded()": FunctionFragment;
        "test_LDOV1_06_submit_updates_limit_and_reverts_on_limit_exceeded()": FunctionFragment;
        "test_LDOV1_07_submit_updates_limit_properly(uint256)": FunctionFragment;
        "underlying()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "IS_TEST" | "cft" | "creditConfigurator" | "creditFacade" | "creditManager" | "failed" | "lidoV1Adapter" | "lidoV1Gateway" | "lidoV1Mock" | "setUp" | "test_LDOV1_01_constructor_sets_correct_params" | "test_LDOV1_02_submit_and_submitAll_reverts_if_user_has_no_account" | "test_LDOV1_03_submit_works_correctly" | "test_LDOV1_04_submitAll_works_correctly" | "test_LDOV1_05_submit_updates_limit_and_reverts_on_limit_exceeded" | "test_LDOV1_06_submit_updates_limit_and_reverts_on_limit_exceeded" | "test_LDOV1_07_submit_updates_limit_properly" | "underlying"): FunctionFragment;
    encodeFunctionData(functionFragment: "IS_TEST", values?: undefined): string;
    encodeFunctionData(functionFragment: "cft", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditConfigurator", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditFacade", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "failed", values?: undefined): string;
    encodeFunctionData(functionFragment: "lidoV1Adapter", values?: undefined): string;
    encodeFunctionData(functionFragment: "lidoV1Gateway", values?: undefined): string;
    encodeFunctionData(functionFragment: "lidoV1Mock", values?: undefined): string;
    encodeFunctionData(functionFragment: "setUp", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_LDOV1_01_constructor_sets_correct_params", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_LDOV1_02_submit_and_submitAll_reverts_if_user_has_no_account", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_LDOV1_03_submit_works_correctly", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_LDOV1_04_submitAll_works_correctly", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_LDOV1_05_submit_updates_limit_and_reverts_on_limit_exceeded", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_LDOV1_06_submit_updates_limit_and_reverts_on_limit_exceeded", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_LDOV1_07_submit_updates_limit_properly", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "underlying", values?: undefined): string;
    decodeFunctionResult(functionFragment: "IS_TEST", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cft", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditConfigurator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditFacade", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "failed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lidoV1Adapter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lidoV1Gateway", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lidoV1Mock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setUp", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_LDOV1_01_constructor_sets_correct_params", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_LDOV1_02_submit_and_submitAll_reverts_if_user_has_no_account", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_LDOV1_03_submit_works_correctly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_LDOV1_04_submitAll_works_correctly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_LDOV1_05_submit_updates_limit_and_reverts_on_limit_exceeded", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_LDOV1_06_submit_updates_limit_and_reverts_on_limit_exceeded", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_LDOV1_07_submit_updates_limit_properly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "underlying", data: BytesLike): Result;
    events: {
        "AddCollateral(address,address,uint256)": EventFragment;
        "CloseCreditAccount(address,address)": EventFragment;
        "DecreaseBorrowedAmount(address,uint256)": EventFragment;
        "ExecuteOrder(address,address)": EventFragment;
        "IncreaseBorrowedAmount(address,uint256)": EventFragment;
        "LiquidateCreditAccount(address,address,address,uint256)": EventFragment;
        "Mock_Submitted(address,uint256,address)": EventFragment;
        "MultiCallFinished()": EventFragment;
        "MultiCallStarted(address)": EventFragment;
        "NewConfigurator(address)": EventFragment;
        "NewLimit(uint256)": EventFragment;
        "OpenCreditAccount(address,address,uint256,uint16)": EventFragment;
        "TransferAccount(address,address)": EventFragment;
        "TransferAccountAllowed(address,address,bool)": EventFragment;
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
    getEvent(nameOrSignatureOrTopic: "AddCollateral"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "CloseCreditAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "DecreaseBorrowedAmount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExecuteOrder"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IncreaseBorrowedAmount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "LiquidateCreditAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Mock_Submitted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MultiCallFinished"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MultiCallStarted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewConfigurator"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewLimit"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OpenCreditAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferAccountAllowed"): EventFragment;
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
export interface AddCollateralEventObject {
    onBehalfOf: string;
    token: string;
    value: BigNumber;
}
export declare type AddCollateralEvent = TypedEvent<[
    string,
    string,
    BigNumber
], AddCollateralEventObject>;
export declare type AddCollateralEventFilter = TypedEventFilter<AddCollateralEvent>;
export interface CloseCreditAccountEventObject {
    owner: string;
    to: string;
}
export declare type CloseCreditAccountEvent = TypedEvent<[
    string,
    string
], CloseCreditAccountEventObject>;
export declare type CloseCreditAccountEventFilter = TypedEventFilter<CloseCreditAccountEvent>;
export interface DecreaseBorrowedAmountEventObject {
    borrower: string;
    amount: BigNumber;
}
export declare type DecreaseBorrowedAmountEvent = TypedEvent<[
    string,
    BigNumber
], DecreaseBorrowedAmountEventObject>;
export declare type DecreaseBorrowedAmountEventFilter = TypedEventFilter<DecreaseBorrowedAmountEvent>;
export interface ExecuteOrderEventObject {
    borrower: string;
    target: string;
}
export declare type ExecuteOrderEvent = TypedEvent<[
    string,
    string
], ExecuteOrderEventObject>;
export declare type ExecuteOrderEventFilter = TypedEventFilter<ExecuteOrderEvent>;
export interface IncreaseBorrowedAmountEventObject {
    borrower: string;
    amount: BigNumber;
}
export declare type IncreaseBorrowedAmountEvent = TypedEvent<[
    string,
    BigNumber
], IncreaseBorrowedAmountEventObject>;
export declare type IncreaseBorrowedAmountEventFilter = TypedEventFilter<IncreaseBorrowedAmountEvent>;
export interface LiquidateCreditAccountEventObject {
    owner: string;
    liquidator: string;
    to: string;
    remainingFunds: BigNumber;
}
export declare type LiquidateCreditAccountEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber
], LiquidateCreditAccountEventObject>;
export declare type LiquidateCreditAccountEventFilter = TypedEventFilter<LiquidateCreditAccountEvent>;
export interface Mock_SubmittedEventObject {
    sender: string;
    amount: BigNumber;
    referral: string;
}
export declare type Mock_SubmittedEvent = TypedEvent<[
    string,
    BigNumber,
    string
], Mock_SubmittedEventObject>;
export declare type Mock_SubmittedEventFilter = TypedEventFilter<Mock_SubmittedEvent>;
export interface MultiCallFinishedEventObject {
}
export declare type MultiCallFinishedEvent = TypedEvent<[
], MultiCallFinishedEventObject>;
export declare type MultiCallFinishedEventFilter = TypedEventFilter<MultiCallFinishedEvent>;
export interface MultiCallStartedEventObject {
    borrower: string;
}
export declare type MultiCallStartedEvent = TypedEvent<[
    string
], MultiCallStartedEventObject>;
export declare type MultiCallStartedEventFilter = TypedEventFilter<MultiCallStartedEvent>;
export interface NewConfiguratorEventObject {
    newConfigurator: string;
}
export declare type NewConfiguratorEvent = TypedEvent<[
    string
], NewConfiguratorEventObject>;
export declare type NewConfiguratorEventFilter = TypedEventFilter<NewConfiguratorEvent>;
export interface NewLimitEventObject {
    _limit: BigNumber;
}
export declare type NewLimitEvent = TypedEvent<[BigNumber], NewLimitEventObject>;
export declare type NewLimitEventFilter = TypedEventFilter<NewLimitEvent>;
export interface OpenCreditAccountEventObject {
    onBehalfOf: string;
    creditAccount: string;
    borrowAmount: BigNumber;
    referralCode: number;
}
export declare type OpenCreditAccountEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    number
], OpenCreditAccountEventObject>;
export declare type OpenCreditAccountEventFilter = TypedEventFilter<OpenCreditAccountEvent>;
export interface TransferAccountEventObject {
    oldOwner: string;
    newOwner: string;
}
export declare type TransferAccountEvent = TypedEvent<[
    string,
    string
], TransferAccountEventObject>;
export declare type TransferAccountEventFilter = TypedEventFilter<TransferAccountEvent>;
export interface TransferAccountAllowedEventObject {
    from: string;
    to: string;
    state: boolean;
}
export declare type TransferAccountAllowedEvent = TypedEvent<[
    string,
    string,
    boolean
], TransferAccountAllowedEventObject>;
export declare type TransferAccountAllowedEventFilter = TypedEventFilter<TransferAccountAllowedEvent>;
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
export interface LidoV1AdapterTest extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: LidoV1AdapterTestInterface;
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
        cft(overrides?: CallOverrides): Promise<[string]>;
        creditConfigurator(overrides?: CallOverrides): Promise<[string]>;
        creditFacade(overrides?: CallOverrides): Promise<[string]>;
        creditManager(overrides?: CallOverrides): Promise<[string]>;
        failed(overrides?: CallOverrides): Promise<[boolean]>;
        lidoV1Adapter(overrides?: CallOverrides): Promise<[string]>;
        lidoV1Gateway(overrides?: CallOverrides): Promise<[string]>;
        lidoV1Mock(overrides?: CallOverrides): Promise<[string]>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_LDOV1_01_constructor_sets_correct_params(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_LDOV1_02_submit_and_submitAll_reverts_if_user_has_no_account(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_LDOV1_03_submit_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_LDOV1_04_submitAll_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_LDOV1_05_submit_updates_limit_and_reverts_on_limit_exceeded(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_LDOV1_06_submit_updates_limit_and_reverts_on_limit_exceeded(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_LDOV1_07_submit_updates_limit_properly(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        underlying(overrides?: CallOverrides): Promise<[string]>;
    };
    IS_TEST(overrides?: CallOverrides): Promise<boolean>;
    cft(overrides?: CallOverrides): Promise<string>;
    creditConfigurator(overrides?: CallOverrides): Promise<string>;
    creditFacade(overrides?: CallOverrides): Promise<string>;
    creditManager(overrides?: CallOverrides): Promise<string>;
    failed(overrides?: CallOverrides): Promise<boolean>;
    lidoV1Adapter(overrides?: CallOverrides): Promise<string>;
    lidoV1Gateway(overrides?: CallOverrides): Promise<string>;
    lidoV1Mock(overrides?: CallOverrides): Promise<string>;
    setUp(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_LDOV1_01_constructor_sets_correct_params(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_LDOV1_02_submit_and_submitAll_reverts_if_user_has_no_account(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_LDOV1_03_submit_works_correctly(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_LDOV1_04_submitAll_works_correctly(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_LDOV1_05_submit_updates_limit_and_reverts_on_limit_exceeded(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_LDOV1_06_submit_updates_limit_and_reverts_on_limit_exceeded(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_LDOV1_07_submit_updates_limit_properly(amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    underlying(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        IS_TEST(overrides?: CallOverrides): Promise<boolean>;
        cft(overrides?: CallOverrides): Promise<string>;
        creditConfigurator(overrides?: CallOverrides): Promise<string>;
        creditFacade(overrides?: CallOverrides): Promise<string>;
        creditManager(overrides?: CallOverrides): Promise<string>;
        failed(overrides?: CallOverrides): Promise<boolean>;
        lidoV1Adapter(overrides?: CallOverrides): Promise<string>;
        lidoV1Gateway(overrides?: CallOverrides): Promise<string>;
        lidoV1Mock(overrides?: CallOverrides): Promise<string>;
        setUp(overrides?: CallOverrides): Promise<void>;
        test_LDOV1_01_constructor_sets_correct_params(overrides?: CallOverrides): Promise<void>;
        test_LDOV1_02_submit_and_submitAll_reverts_if_user_has_no_account(overrides?: CallOverrides): Promise<void>;
        test_LDOV1_03_submit_works_correctly(overrides?: CallOverrides): Promise<void>;
        test_LDOV1_04_submitAll_works_correctly(overrides?: CallOverrides): Promise<void>;
        test_LDOV1_05_submit_updates_limit_and_reverts_on_limit_exceeded(overrides?: CallOverrides): Promise<void>;
        test_LDOV1_06_submit_updates_limit_and_reverts_on_limit_exceeded(overrides?: CallOverrides): Promise<void>;
        test_LDOV1_07_submit_updates_limit_properly(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        underlying(overrides?: CallOverrides): Promise<string>;
    };
    filters: {
        "AddCollateral(address,address,uint256)"(onBehalfOf?: string | null, token?: string | null, value?: null): AddCollateralEventFilter;
        AddCollateral(onBehalfOf?: string | null, token?: string | null, value?: null): AddCollateralEventFilter;
        "CloseCreditAccount(address,address)"(owner?: string | null, to?: string | null): CloseCreditAccountEventFilter;
        CloseCreditAccount(owner?: string | null, to?: string | null): CloseCreditAccountEventFilter;
        "DecreaseBorrowedAmount(address,uint256)"(borrower?: string | null, amount?: null): DecreaseBorrowedAmountEventFilter;
        DecreaseBorrowedAmount(borrower?: string | null, amount?: null): DecreaseBorrowedAmountEventFilter;
        "ExecuteOrder(address,address)"(borrower?: string | null, target?: string | null): ExecuteOrderEventFilter;
        ExecuteOrder(borrower?: string | null, target?: string | null): ExecuteOrderEventFilter;
        "IncreaseBorrowedAmount(address,uint256)"(borrower?: string | null, amount?: null): IncreaseBorrowedAmountEventFilter;
        IncreaseBorrowedAmount(borrower?: string | null, amount?: null): IncreaseBorrowedAmountEventFilter;
        "LiquidateCreditAccount(address,address,address,uint256)"(owner?: string | null, liquidator?: string | null, to?: string | null, remainingFunds?: null): LiquidateCreditAccountEventFilter;
        LiquidateCreditAccount(owner?: string | null, liquidator?: string | null, to?: string | null, remainingFunds?: null): LiquidateCreditAccountEventFilter;
        "Mock_Submitted(address,uint256,address)"(sender?: string | null, amount?: null, referral?: null): Mock_SubmittedEventFilter;
        Mock_Submitted(sender?: string | null, amount?: null, referral?: null): Mock_SubmittedEventFilter;
        "MultiCallFinished()"(): MultiCallFinishedEventFilter;
        MultiCallFinished(): MultiCallFinishedEventFilter;
        "MultiCallStarted(address)"(borrower?: string | null): MultiCallStartedEventFilter;
        MultiCallStarted(borrower?: string | null): MultiCallStartedEventFilter;
        "NewConfigurator(address)"(newConfigurator?: string | null): NewConfiguratorEventFilter;
        NewConfigurator(newConfigurator?: string | null): NewConfiguratorEventFilter;
        "NewLimit(uint256)"(_limit?: null): NewLimitEventFilter;
        NewLimit(_limit?: null): NewLimitEventFilter;
        "OpenCreditAccount(address,address,uint256,uint16)"(onBehalfOf?: string | null, creditAccount?: string | null, borrowAmount?: null, referralCode?: null): OpenCreditAccountEventFilter;
        OpenCreditAccount(onBehalfOf?: string | null, creditAccount?: string | null, borrowAmount?: null, referralCode?: null): OpenCreditAccountEventFilter;
        "TransferAccount(address,address)"(oldOwner?: string | null, newOwner?: string | null): TransferAccountEventFilter;
        TransferAccount(oldOwner?: string | null, newOwner?: string | null): TransferAccountEventFilter;
        "TransferAccountAllowed(address,address,bool)"(from?: string | null, to?: string | null, state?: null): TransferAccountAllowedEventFilter;
        TransferAccountAllowed(from?: string | null, to?: string | null, state?: null): TransferAccountAllowedEventFilter;
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
        cft(overrides?: CallOverrides): Promise<BigNumber>;
        creditConfigurator(overrides?: CallOverrides): Promise<BigNumber>;
        creditFacade(overrides?: CallOverrides): Promise<BigNumber>;
        creditManager(overrides?: CallOverrides): Promise<BigNumber>;
        failed(overrides?: CallOverrides): Promise<BigNumber>;
        lidoV1Adapter(overrides?: CallOverrides): Promise<BigNumber>;
        lidoV1Gateway(overrides?: CallOverrides): Promise<BigNumber>;
        lidoV1Mock(overrides?: CallOverrides): Promise<BigNumber>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_LDOV1_01_constructor_sets_correct_params(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_LDOV1_02_submit_and_submitAll_reverts_if_user_has_no_account(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_LDOV1_03_submit_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_LDOV1_04_submitAll_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_LDOV1_05_submit_updates_limit_and_reverts_on_limit_exceeded(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_LDOV1_06_submit_updates_limit_and_reverts_on_limit_exceeded(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_LDOV1_07_submit_updates_limit_properly(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        underlying(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        IS_TEST(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        cft(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditConfigurator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditFacade(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        failed(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lidoV1Adapter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lidoV1Gateway(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lidoV1Mock(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_LDOV1_01_constructor_sets_correct_params(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_LDOV1_02_submit_and_submitAll_reverts_if_user_has_no_account(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_LDOV1_03_submit_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_LDOV1_04_submitAll_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_LDOV1_05_submit_updates_limit_and_reverts_on_limit_exceeded(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_LDOV1_06_submit_updates_limit_and_reverts_on_limit_exceeded(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_LDOV1_07_submit_updates_limit_properly(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        underlying(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
