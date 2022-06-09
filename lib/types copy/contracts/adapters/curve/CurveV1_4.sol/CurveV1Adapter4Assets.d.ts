import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface CurveV1Adapter4AssetsInterface extends utils.Interface {
    functions: {
        "_gearboxAdapterType()": FunctionFragment;
        "_gearboxAdapterVersion()": FunctionFragment;
        "add_all_liquidity_one_coin(int128,uint256)": FunctionFragment;
        "add_liquidity(uint256[4],uint256)": FunctionFragment;
        "balances(uint256)": FunctionFragment;
        "coins(uint256)": FunctionFragment;
        "creditFacade()": FunctionFragment;
        "creditManager()": FunctionFragment;
        "exchange(int128,int128,uint256,uint256)": FunctionFragment;
        "exchange_all(int128,int128,uint256)": FunctionFragment;
        "exchange_all_underlying(int128,int128,uint256)": FunctionFragment;
        "exchange_underlying(int128,int128,uint256,uint256)": FunctionFragment;
        "get_dy(int128,int128,uint256)": FunctionFragment;
        "get_dy_underlying(int128,int128,uint256)": FunctionFragment;
        "get_virtual_price()": FunctionFragment;
        "lp_token()": FunctionFragment;
        "metapoolBase()": FunctionFragment;
        "remove_all_liquidity_one_coin(int128,uint256)": FunctionFragment;
        "remove_liquidity(uint256,uint256[4])": FunctionFragment;
        "remove_liquidity_imbalance(uint256[4],uint256)": FunctionFragment;
        "remove_liquidity_one_coin(uint256,int128,uint256)": FunctionFragment;
        "targetContract()": FunctionFragment;
        "token()": FunctionFragment;
        "token0()": FunctionFragment;
        "token1()": FunctionFragment;
        "token2()": FunctionFragment;
        "token3()": FunctionFragment;
        "underlying_coins(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "_gearboxAdapterType" | "_gearboxAdapterVersion" | "add_all_liquidity_one_coin" | "add_liquidity" | "balances" | "coins" | "creditFacade" | "creditManager" | "exchange" | "exchange_all" | "exchange_all_underlying" | "exchange_underlying" | "get_dy" | "get_dy_underlying" | "get_virtual_price" | "lp_token" | "metapoolBase" | "remove_all_liquidity_one_coin" | "remove_liquidity" | "remove_liquidity_imbalance" | "remove_liquidity_one_coin" | "targetContract" | "token" | "token0" | "token1" | "token2" | "token3" | "underlying_coins"): FunctionFragment;
    encodeFunctionData(functionFragment: "_gearboxAdapterType", values?: undefined): string;
    encodeFunctionData(functionFragment: "_gearboxAdapterVersion", values?: undefined): string;
    encodeFunctionData(functionFragment: "add_all_liquidity_one_coin", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "add_liquidity", values: [
        [
            BigNumberish,
            BigNumberish,
            BigNumberish,
            BigNumberish
        ],
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "balances", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "coins", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "creditFacade", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "exchange", values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "exchange_all", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "exchange_all_underlying", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "exchange_underlying", values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "get_dy", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "get_dy_underlying", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "get_virtual_price", values?: undefined): string;
    encodeFunctionData(functionFragment: "lp_token", values?: undefined): string;
    encodeFunctionData(functionFragment: "metapoolBase", values?: undefined): string;
    encodeFunctionData(functionFragment: "remove_all_liquidity_one_coin", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "remove_liquidity", values: [
        BigNumberish,
        [
            BigNumberish,
            BigNumberish,
            BigNumberish,
            BigNumberish
        ]
    ]): string;
    encodeFunctionData(functionFragment: "remove_liquidity_imbalance", values: [
        [
            BigNumberish,
            BigNumberish,
            BigNumberish,
            BigNumberish
        ],
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "remove_liquidity_one_coin", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "targetContract", values?: undefined): string;
    encodeFunctionData(functionFragment: "token", values?: undefined): string;
    encodeFunctionData(functionFragment: "token0", values?: undefined): string;
    encodeFunctionData(functionFragment: "token1", values?: undefined): string;
    encodeFunctionData(functionFragment: "token2", values?: undefined): string;
    encodeFunctionData(functionFragment: "token3", values?: undefined): string;
    encodeFunctionData(functionFragment: "underlying_coins", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "_gearboxAdapterType", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "_gearboxAdapterVersion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "add_all_liquidity_one_coin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "add_liquidity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balances", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "coins", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditFacade", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exchange", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exchange_all", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exchange_all_underlying", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exchange_underlying", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "get_dy", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "get_dy_underlying", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "get_virtual_price", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lp_token", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metapoolBase", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "remove_all_liquidity_one_coin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "remove_liquidity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "remove_liquidity_imbalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "remove_liquidity_one_coin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "targetContract", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "token0", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "token1", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "token2", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "token3", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "underlying_coins", data: BytesLike): Result;
    events: {};
}
export interface CurveV1Adapter4Assets extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: CurveV1Adapter4AssetsInterface;
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
        _gearboxAdapterType(overrides?: CallOverrides): Promise<[number]>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<[number]>;
        add_all_liquidity_one_coin(i: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        add_liquidity(amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        balances(i: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        coins(i: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
        creditFacade(overrides?: CallOverrides): Promise<[string]>;
        creditManager(overrides?: CallOverrides): Promise<[string]>;
        exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        exchange_all(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        exchange_all_underlying(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        get_dy(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        get_dy_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        get_virtual_price(overrides?: CallOverrides): Promise<[BigNumber]>;
        lp_token(overrides?: CallOverrides): Promise<[string]>;
        metapoolBase(overrides?: CallOverrides): Promise<[string]>;
        remove_all_liquidity_one_coin(i: BigNumberish, minRateRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        remove_liquidity(arg0: BigNumberish, arg1: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        remove_liquidity_one_coin(arg0: BigNumberish, i: BigNumberish, arg2: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        targetContract(overrides?: CallOverrides): Promise<[string]>;
        token(overrides?: CallOverrides): Promise<[string]>;
        token0(overrides?: CallOverrides): Promise<[string]>;
        token1(overrides?: CallOverrides): Promise<[string]>;
        token2(overrides?: CallOverrides): Promise<[string]>;
        token3(overrides?: CallOverrides): Promise<[string]>;
        underlying_coins(i: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
    };
    _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;
    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;
    add_all_liquidity_one_coin(i: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    add_liquidity(amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], arg1: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    balances(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    coins(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
    creditFacade(overrides?: CallOverrides): Promise<string>;
    creditManager(overrides?: CallOverrides): Promise<string>;
    exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    exchange_all(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    exchange_all_underlying(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    get_dy(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    get_dy_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;
    lp_token(overrides?: CallOverrides): Promise<string>;
    metapoolBase(overrides?: CallOverrides): Promise<string>;
    remove_all_liquidity_one_coin(i: BigNumberish, minRateRAY: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    remove_liquidity(arg0: BigNumberish, arg1: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], arg1: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    remove_liquidity_one_coin(arg0: BigNumberish, i: BigNumberish, arg2: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    targetContract(overrides?: CallOverrides): Promise<string>;
    token(overrides?: CallOverrides): Promise<string>;
    token0(overrides?: CallOverrides): Promise<string>;
    token1(overrides?: CallOverrides): Promise<string>;
    token2(overrides?: CallOverrides): Promise<string>;
    token3(overrides?: CallOverrides): Promise<string>;
    underlying_coins(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
    callStatic: {
        _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;
        add_all_liquidity_one_coin(i: BigNumberish, rateMinRAY: BigNumberish, overrides?: CallOverrides): Promise<void>;
        add_liquidity(amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], arg1: BigNumberish, overrides?: CallOverrides): Promise<void>;
        balances(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        coins(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
        creditFacade(overrides?: CallOverrides): Promise<string>;
        creditManager(overrides?: CallOverrides): Promise<string>;
        exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: CallOverrides): Promise<void>;
        exchange_all(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish, overrides?: CallOverrides): Promise<void>;
        exchange_all_underlying(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish, overrides?: CallOverrides): Promise<void>;
        exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: CallOverrides): Promise<void>;
        get_dy(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        get_dy_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;
        lp_token(overrides?: CallOverrides): Promise<string>;
        metapoolBase(overrides?: CallOverrides): Promise<string>;
        remove_all_liquidity_one_coin(i: BigNumberish, minRateRAY: BigNumberish, overrides?: CallOverrides): Promise<void>;
        remove_liquidity(arg0: BigNumberish, arg1: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], overrides?: CallOverrides): Promise<void>;
        remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], arg1: BigNumberish, overrides?: CallOverrides): Promise<void>;
        remove_liquidity_one_coin(arg0: BigNumberish, i: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<void>;
        targetContract(overrides?: CallOverrides): Promise<string>;
        token(overrides?: CallOverrides): Promise<string>;
        token0(overrides?: CallOverrides): Promise<string>;
        token1(overrides?: CallOverrides): Promise<string>;
        token2(overrides?: CallOverrides): Promise<string>;
        token3(overrides?: CallOverrides): Promise<string>;
        underlying_coins(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        _gearboxAdapterType(overrides?: CallOverrides): Promise<BigNumber>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<BigNumber>;
        add_all_liquidity_one_coin(i: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        add_liquidity(amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        balances(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        coins(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        creditFacade(overrides?: CallOverrides): Promise<BigNumber>;
        creditManager(overrides?: CallOverrides): Promise<BigNumber>;
        exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        exchange_all(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        exchange_all_underlying(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        get_dy(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        get_dy_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;
        lp_token(overrides?: CallOverrides): Promise<BigNumber>;
        metapoolBase(overrides?: CallOverrides): Promise<BigNumber>;
        remove_all_liquidity_one_coin(i: BigNumberish, minRateRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        remove_liquidity(arg0: BigNumberish, arg1: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        remove_liquidity_one_coin(arg0: BigNumberish, i: BigNumberish, arg2: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        targetContract(overrides?: CallOverrides): Promise<BigNumber>;
        token(overrides?: CallOverrides): Promise<BigNumber>;
        token0(overrides?: CallOverrides): Promise<BigNumber>;
        token1(overrides?: CallOverrides): Promise<BigNumber>;
        token2(overrides?: CallOverrides): Promise<BigNumber>;
        token3(overrides?: CallOverrides): Promise<BigNumber>;
        underlying_coins(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        _gearboxAdapterType(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        add_all_liquidity_one_coin(i: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        add_liquidity(amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        balances(i: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        coins(i: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditFacade(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        exchange_all(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        exchange_all_underlying(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        get_dy(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        get_dy_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        get_virtual_price(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lp_token(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        metapoolBase(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        remove_all_liquidity_one_coin(i: BigNumberish, minRateRAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        remove_liquidity(arg0: BigNumberish, arg1: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish], arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        remove_liquidity_one_coin(arg0: BigNumberish, i: BigNumberish, arg2: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        targetContract(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        token(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        token0(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        token1(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        token2(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        token3(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        underlying_coins(i: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
