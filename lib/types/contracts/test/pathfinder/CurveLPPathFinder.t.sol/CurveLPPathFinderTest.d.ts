import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface CurveLPPathFinderTestInterface extends utils.Interface {
    functions: {
        "IS_TEST()": FunctionFragment;
        "_setUpCurve(bool)": FunctionFragment;
        "cft()": FunctionFragment;
        "creditConfigurator()": FunctionFragment;
        "creditFacade()": FunctionFragment;
        "creditManager()": FunctionFragment;
        "curveAdapter()": FunctionFragment;
        "curveLPPathFinder()": FunctionFragment;
        "curveMetaAdapter()": FunctionFragment;
        "curvePathFinder()": FunctionFragment;
        "curveV1MetaMock()": FunctionFragment;
        "curveV1Mock()": FunctionFragment;
        "failed()": FunctionFragment;
        "setUp()": FunctionFragment;
        "test_CLPPF_01_filterCurveLPAdapters_finds_yearn_adapters_only()": FunctionFragment;
        "test_CLPPF_02_withdrawAll_works_correctly()": FunctionFragment;
        "tokenMasksMap(address)": FunctionFragment;
        "underlying()": FunctionFragment;
        "uniV2adapter()": FunctionFragment;
        "uniV2mock()": FunctionFragment;
        "uniV2pathFinder()": FunctionFragment;
        "uniV3adapter()": FunctionFragment;
        "uniV3mock()": FunctionFragment;
        "uniV3pathFinder()": FunctionFragment;
        "yearnAdapter()": FunctionFragment;
        "yearnMock()": FunctionFragment;
        "yearnPathFinder()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "IS_TEST" | "_setUpCurve" | "cft" | "creditConfigurator" | "creditFacade" | "creditManager" | "curveAdapter" | "curveLPPathFinder" | "curveMetaAdapter" | "curvePathFinder" | "curveV1MetaMock" | "curveV1Mock" | "failed" | "setUp" | "test_CLPPF_01_filterCurveLPAdapters_finds_yearn_adapters_only" | "test_CLPPF_02_withdrawAll_works_correctly" | "tokenMasksMap" | "underlying" | "uniV2adapter" | "uniV2mock" | "uniV2pathFinder" | "uniV3adapter" | "uniV3mock" | "uniV3pathFinder" | "yearnAdapter" | "yearnMock" | "yearnPathFinder"): FunctionFragment;
    encodeFunctionData(functionFragment: "IS_TEST", values?: undefined): string;
    encodeFunctionData(functionFragment: "_setUpCurve", values: [boolean]): string;
    encodeFunctionData(functionFragment: "cft", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditConfigurator", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditFacade", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "curveAdapter", values?: undefined): string;
    encodeFunctionData(functionFragment: "curveLPPathFinder", values?: undefined): string;
    encodeFunctionData(functionFragment: "curveMetaAdapter", values?: undefined): string;
    encodeFunctionData(functionFragment: "curvePathFinder", values?: undefined): string;
    encodeFunctionData(functionFragment: "curveV1MetaMock", values?: undefined): string;
    encodeFunctionData(functionFragment: "curveV1Mock", values?: undefined): string;
    encodeFunctionData(functionFragment: "failed", values?: undefined): string;
    encodeFunctionData(functionFragment: "setUp", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CLPPF_01_filterCurveLPAdapters_finds_yearn_adapters_only", values?: undefined): string;
    encodeFunctionData(functionFragment: "test_CLPPF_02_withdrawAll_works_correctly", values?: undefined): string;
    encodeFunctionData(functionFragment: "tokenMasksMap", values: [string]): string;
    encodeFunctionData(functionFragment: "underlying", values?: undefined): string;
    encodeFunctionData(functionFragment: "uniV2adapter", values?: undefined): string;
    encodeFunctionData(functionFragment: "uniV2mock", values?: undefined): string;
    encodeFunctionData(functionFragment: "uniV2pathFinder", values?: undefined): string;
    encodeFunctionData(functionFragment: "uniV3adapter", values?: undefined): string;
    encodeFunctionData(functionFragment: "uniV3mock", values?: undefined): string;
    encodeFunctionData(functionFragment: "uniV3pathFinder", values?: undefined): string;
    encodeFunctionData(functionFragment: "yearnAdapter", values?: undefined): string;
    encodeFunctionData(functionFragment: "yearnMock", values?: undefined): string;
    encodeFunctionData(functionFragment: "yearnPathFinder", values?: undefined): string;
    decodeFunctionResult(functionFragment: "IS_TEST", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "_setUpCurve", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cft", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditConfigurator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditFacade", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "curveAdapter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "curveLPPathFinder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "curveMetaAdapter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "curvePathFinder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "curveV1MetaMock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "curveV1Mock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "failed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setUp", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CLPPF_01_filterCurveLPAdapters_finds_yearn_adapters_only", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "test_CLPPF_02_withdrawAll_works_correctly", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenMasksMap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "underlying", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uniV2adapter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uniV2mock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uniV2pathFinder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uniV3adapter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uniV3mock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uniV3pathFinder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "yearnAdapter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "yearnMock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "yearnPathFinder", data: BytesLike): Result;
    events: {
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
export interface CurveLPPathFinderTest extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: CurveLPPathFinderTestInterface;
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
        _setUpCurve(withUnderlyings: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        cft(overrides?: CallOverrides): Promise<[string]>;
        creditConfigurator(overrides?: CallOverrides): Promise<[string]>;
        creditFacade(overrides?: CallOverrides): Promise<[string]>;
        creditManager(overrides?: CallOverrides): Promise<[string]>;
        curveAdapter(overrides?: CallOverrides): Promise<[string]>;
        curveLPPathFinder(overrides?: CallOverrides): Promise<[string]>;
        curveMetaAdapter(overrides?: CallOverrides): Promise<[string]>;
        curvePathFinder(overrides?: CallOverrides): Promise<[string]>;
        curveV1MetaMock(overrides?: CallOverrides): Promise<[string]>;
        curveV1Mock(overrides?: CallOverrides): Promise<[string]>;
        failed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CLPPF_01_filterCurveLPAdapters_finds_yearn_adapters_only(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        test_CLPPF_02_withdrawAll_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        tokenMasksMap(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        underlying(overrides?: CallOverrides): Promise<[string]>;
        uniV2adapter(overrides?: CallOverrides): Promise<[string]>;
        uniV2mock(overrides?: CallOverrides): Promise<[string]>;
        uniV2pathFinder(overrides?: CallOverrides): Promise<[string]>;
        uniV3adapter(overrides?: CallOverrides): Promise<[string]>;
        uniV3mock(overrides?: CallOverrides): Promise<[string]>;
        uniV3pathFinder(overrides?: CallOverrides): Promise<[string]>;
        yearnAdapter(overrides?: CallOverrides): Promise<[string]>;
        yearnMock(overrides?: CallOverrides): Promise<[string]>;
        yearnPathFinder(overrides?: CallOverrides): Promise<[string]>;
    };
    IS_TEST(overrides?: CallOverrides): Promise<boolean>;
    _setUpCurve(withUnderlyings: boolean, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    cft(overrides?: CallOverrides): Promise<string>;
    creditConfigurator(overrides?: CallOverrides): Promise<string>;
    creditFacade(overrides?: CallOverrides): Promise<string>;
    creditManager(overrides?: CallOverrides): Promise<string>;
    curveAdapter(overrides?: CallOverrides): Promise<string>;
    curveLPPathFinder(overrides?: CallOverrides): Promise<string>;
    curveMetaAdapter(overrides?: CallOverrides): Promise<string>;
    curvePathFinder(overrides?: CallOverrides): Promise<string>;
    curveV1MetaMock(overrides?: CallOverrides): Promise<string>;
    curveV1Mock(overrides?: CallOverrides): Promise<string>;
    failed(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    setUp(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CLPPF_01_filterCurveLPAdapters_finds_yearn_adapters_only(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    test_CLPPF_02_withdrawAll_works_correctly(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    tokenMasksMap(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
    underlying(overrides?: CallOverrides): Promise<string>;
    uniV2adapter(overrides?: CallOverrides): Promise<string>;
    uniV2mock(overrides?: CallOverrides): Promise<string>;
    uniV2pathFinder(overrides?: CallOverrides): Promise<string>;
    uniV3adapter(overrides?: CallOverrides): Promise<string>;
    uniV3mock(overrides?: CallOverrides): Promise<string>;
    uniV3pathFinder(overrides?: CallOverrides): Promise<string>;
    yearnAdapter(overrides?: CallOverrides): Promise<string>;
    yearnMock(overrides?: CallOverrides): Promise<string>;
    yearnPathFinder(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        IS_TEST(overrides?: CallOverrides): Promise<boolean>;
        _setUpCurve(withUnderlyings: boolean, overrides?: CallOverrides): Promise<void>;
        cft(overrides?: CallOverrides): Promise<string>;
        creditConfigurator(overrides?: CallOverrides): Promise<string>;
        creditFacade(overrides?: CallOverrides): Promise<string>;
        creditManager(overrides?: CallOverrides): Promise<string>;
        curveAdapter(overrides?: CallOverrides): Promise<string>;
        curveLPPathFinder(overrides?: CallOverrides): Promise<string>;
        curveMetaAdapter(overrides?: CallOverrides): Promise<string>;
        curvePathFinder(overrides?: CallOverrides): Promise<string>;
        curveV1MetaMock(overrides?: CallOverrides): Promise<string>;
        curveV1Mock(overrides?: CallOverrides): Promise<string>;
        failed(overrides?: CallOverrides): Promise<boolean>;
        setUp(overrides?: CallOverrides): Promise<void>;
        test_CLPPF_01_filterCurveLPAdapters_finds_yearn_adapters_only(overrides?: CallOverrides): Promise<void>;
        test_CLPPF_02_withdrawAll_works_correctly(overrides?: CallOverrides): Promise<void>;
        tokenMasksMap(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        underlying(overrides?: CallOverrides): Promise<string>;
        uniV2adapter(overrides?: CallOverrides): Promise<string>;
        uniV2mock(overrides?: CallOverrides): Promise<string>;
        uniV2pathFinder(overrides?: CallOverrides): Promise<string>;
        uniV3adapter(overrides?: CallOverrides): Promise<string>;
        uniV3mock(overrides?: CallOverrides): Promise<string>;
        uniV3pathFinder(overrides?: CallOverrides): Promise<string>;
        yearnAdapter(overrides?: CallOverrides): Promise<string>;
        yearnMock(overrides?: CallOverrides): Promise<string>;
        yearnPathFinder(overrides?: CallOverrides): Promise<string>;
    };
    filters: {
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
        _setUpCurve(withUnderlyings: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        cft(overrides?: CallOverrides): Promise<BigNumber>;
        creditConfigurator(overrides?: CallOverrides): Promise<BigNumber>;
        creditFacade(overrides?: CallOverrides): Promise<BigNumber>;
        creditManager(overrides?: CallOverrides): Promise<BigNumber>;
        curveAdapter(overrides?: CallOverrides): Promise<BigNumber>;
        curveLPPathFinder(overrides?: CallOverrides): Promise<BigNumber>;
        curveMetaAdapter(overrides?: CallOverrides): Promise<BigNumber>;
        curvePathFinder(overrides?: CallOverrides): Promise<BigNumber>;
        curveV1MetaMock(overrides?: CallOverrides): Promise<BigNumber>;
        curveV1Mock(overrides?: CallOverrides): Promise<BigNumber>;
        failed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CLPPF_01_filterCurveLPAdapters_finds_yearn_adapters_only(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        test_CLPPF_02_withdrawAll_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        tokenMasksMap(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        underlying(overrides?: CallOverrides): Promise<BigNumber>;
        uniV2adapter(overrides?: CallOverrides): Promise<BigNumber>;
        uniV2mock(overrides?: CallOverrides): Promise<BigNumber>;
        uniV2pathFinder(overrides?: CallOverrides): Promise<BigNumber>;
        uniV3adapter(overrides?: CallOverrides): Promise<BigNumber>;
        uniV3mock(overrides?: CallOverrides): Promise<BigNumber>;
        uniV3pathFinder(overrides?: CallOverrides): Promise<BigNumber>;
        yearnAdapter(overrides?: CallOverrides): Promise<BigNumber>;
        yearnMock(overrides?: CallOverrides): Promise<BigNumber>;
        yearnPathFinder(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        IS_TEST(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        _setUpCurve(withUnderlyings: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        cft(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditConfigurator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditFacade(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        curveAdapter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        curveLPPathFinder(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        curveMetaAdapter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        curvePathFinder(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        curveV1MetaMock(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        curveV1Mock(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        failed(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        setUp(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CLPPF_01_filterCurveLPAdapters_finds_yearn_adapters_only(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        test_CLPPF_02_withdrawAll_works_correctly(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        tokenMasksMap(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        underlying(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        uniV2adapter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        uniV2mock(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        uniV2pathFinder(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        uniV3adapter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        uniV3mock(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        uniV3pathFinder(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        yearnAdapter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        yearnMock(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        yearnPathFinder(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
