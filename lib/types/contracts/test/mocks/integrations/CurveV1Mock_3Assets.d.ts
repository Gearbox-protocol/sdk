import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface CurveV1Mock_3AssetsInterface extends utils.Interface {
    functions: {
        "add_liquidity(uint256[3],uint256)": FunctionFragment;
        "balances(int128)": FunctionFragment;
        "balances(uint256)": FunctionFragment;
        "coins(int128)": FunctionFragment;
        "coins(uint256)": FunctionFragment;
        "exchange(int128,int128,uint256,uint256)": FunctionFragment;
        "exchange_underlying(int128,int128,uint256,uint256)": FunctionFragment;
        "get_dy(int128,int128,uint256)": FunctionFragment;
        "get_dy_underlying(int128,int128,uint256)": FunctionFragment;
        "get_virtual_price()": FunctionFragment;
        "lp_token()": FunctionFragment;
        "mintLP(address,uint256)": FunctionFragment;
        "remove_liquidity(uint256,uint256[3])": FunctionFragment;
        "remove_liquidity_imbalance(uint256[3],uint256)": FunctionFragment;
        "remove_liquidity_one_coin(uint256,int128,uint256)": FunctionFragment;
        "setRate(int128,int128,uint256)": FunctionFragment;
        "setRateUnderlying(int128,int128,uint256)": FunctionFragment;
        "set_virtual_price(uint256)": FunctionFragment;
        "token()": FunctionFragment;
        "underlying_coins(int128)": FunctionFragment;
        "underlying_coins(uint256)": FunctionFragment;
        "virtualPrice()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "add_liquidity" | "balances(int128)" | "balances(uint256)" | "coins(int128)" | "coins(uint256)" | "exchange" | "exchange_underlying" | "get_dy" | "get_dy_underlying" | "get_virtual_price" | "lp_token" | "mintLP" | "remove_liquidity" | "remove_liquidity_imbalance" | "remove_liquidity_one_coin" | "setRate" | "setRateUnderlying" | "set_virtual_price" | "token" | "underlying_coins(int128)" | "underlying_coins(uint256)" | "virtualPrice"): FunctionFragment;
    encodeFunctionData(functionFragment: "add_liquidity", values: [[BigNumberish, BigNumberish, BigNumberish], BigNumberish]): string;
    encodeFunctionData(functionFragment: "balances(int128)", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "balances(uint256)", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "coins(int128)", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "coins(uint256)", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "exchange", values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "exchange_underlying", values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "get_dy", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "get_dy_underlying", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "get_virtual_price", values?: undefined): string;
    encodeFunctionData(functionFragment: "lp_token", values?: undefined): string;
    encodeFunctionData(functionFragment: "mintLP", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "remove_liquidity", values: [BigNumberish, [BigNumberish, BigNumberish, BigNumberish]]): string;
    encodeFunctionData(functionFragment: "remove_liquidity_imbalance", values: [[BigNumberish, BigNumberish, BigNumberish], BigNumberish]): string;
    encodeFunctionData(functionFragment: "remove_liquidity_one_coin", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setRate", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setRateUnderlying", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "set_virtual_price", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "token", values?: undefined): string;
    encodeFunctionData(functionFragment: "underlying_coins(int128)", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "underlying_coins(uint256)", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "virtualPrice", values?: undefined): string;
    decodeFunctionResult(functionFragment: "add_liquidity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balances(int128)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balances(uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "coins(int128)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "coins(uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exchange", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exchange_underlying", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "get_dy", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "get_dy_underlying", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "get_virtual_price", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lp_token", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mintLP", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "remove_liquidity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "remove_liquidity_imbalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "remove_liquidity_one_coin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setRate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setRateUnderlying", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "set_virtual_price", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "underlying_coins(int128)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "underlying_coins(uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "virtualPrice", data: BytesLike): Result;
    events: {};
}
export interface CurveV1Mock_3Assets extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: CurveV1Mock_3AssetsInterface;
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
        add_liquidity(amounts: [BigNumberish, BigNumberish, BigNumberish], min_mint_amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        "balances(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        "balances(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        "coins(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
        "coins(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
        exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        get_dy(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        get_dy_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        get_virtual_price(overrides?: CallOverrides): Promise<[BigNumber]>;
        lp_token(overrides?: CallOverrides): Promise<[string]>;
        mintLP(to: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        remove_liquidity(_amount: BigNumberish, min_amounts: [BigNumberish, BigNumberish, BigNumberish], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish, BigNumberish], max_burn_amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        remove_liquidity_one_coin(_token_amount: BigNumberish, i: BigNumberish, min_amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        setRate(i: BigNumberish, j: BigNumberish, rate_RAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        setRateUnderlying(i: BigNumberish, j: BigNumberish, rate_RAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        set_virtual_price(_price: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        token(overrides?: CallOverrides): Promise<[string]>;
        "underlying_coins(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
        "underlying_coins(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
        virtualPrice(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    add_liquidity(amounts: [BigNumberish, BigNumberish, BigNumberish], min_mint_amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    "balances(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    "balances(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    "coins(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
    "coins(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
    exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    get_dy(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    get_dy_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;
    lp_token(overrides?: CallOverrides): Promise<string>;
    mintLP(to: string, amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    remove_liquidity(_amount: BigNumberish, min_amounts: [BigNumberish, BigNumberish, BigNumberish], overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish, BigNumberish], max_burn_amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    remove_liquidity_one_coin(_token_amount: BigNumberish, i: BigNumberish, min_amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    setRate(i: BigNumberish, j: BigNumberish, rate_RAY: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    setRateUnderlying(i: BigNumberish, j: BigNumberish, rate_RAY: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    set_virtual_price(_price: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    token(overrides?: CallOverrides): Promise<string>;
    "underlying_coins(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
    "underlying_coins(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
    virtualPrice(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        add_liquidity(amounts: [BigNumberish, BigNumberish, BigNumberish], min_mint_amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        "balances(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        "balances(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        "coins(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
        "coins(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
        exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: CallOverrides): Promise<void>;
        exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: CallOverrides): Promise<void>;
        get_dy(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        get_dy_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;
        lp_token(overrides?: CallOverrides): Promise<string>;
        mintLP(to: string, amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        remove_liquidity(_amount: BigNumberish, min_amounts: [BigNumberish, BigNumberish, BigNumberish], overrides?: CallOverrides): Promise<void>;
        remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish, BigNumberish], max_burn_amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        remove_liquidity_one_coin(_token_amount: BigNumberish, i: BigNumberish, min_amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        setRate(i: BigNumberish, j: BigNumberish, rate_RAY: BigNumberish, overrides?: CallOverrides): Promise<void>;
        setRateUnderlying(i: BigNumberish, j: BigNumberish, rate_RAY: BigNumberish, overrides?: CallOverrides): Promise<void>;
        set_virtual_price(_price: BigNumberish, overrides?: CallOverrides): Promise<void>;
        token(overrides?: CallOverrides): Promise<string>;
        "underlying_coins(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
        "underlying_coins(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
        virtualPrice(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        add_liquidity(amounts: [BigNumberish, BigNumberish, BigNumberish], min_mint_amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        "balances(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        "balances(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        "coins(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        "coins(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        get_dy(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        get_dy_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;
        lp_token(overrides?: CallOverrides): Promise<BigNumber>;
        mintLP(to: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        remove_liquidity(_amount: BigNumberish, min_amounts: [BigNumberish, BigNumberish, BigNumberish], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish, BigNumberish], max_burn_amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        remove_liquidity_one_coin(_token_amount: BigNumberish, i: BigNumberish, min_amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        setRate(i: BigNumberish, j: BigNumberish, rate_RAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        setRateUnderlying(i: BigNumberish, j: BigNumberish, rate_RAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        set_virtual_price(_price: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        token(overrides?: CallOverrides): Promise<BigNumber>;
        "underlying_coins(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        "underlying_coins(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        virtualPrice(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        add_liquidity(amounts: [BigNumberish, BigNumberish, BigNumberish], min_mint_amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        "balances(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "balances(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "coins(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "coins(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        get_dy(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        get_dy_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        get_virtual_price(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lp_token(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        mintLP(to: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        remove_liquidity(_amount: BigNumberish, min_amounts: [BigNumberish, BigNumberish, BigNumberish], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish, BigNumberish], max_burn_amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        remove_liquidity_one_coin(_token_amount: BigNumberish, i: BigNumberish, min_amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        setRate(i: BigNumberish, j: BigNumberish, rate_RAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        setRateUnderlying(i: BigNumberish, j: BigNumberish, rate_RAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        set_virtual_price(_price: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        token(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "underlying_coins(int128)"(i: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "underlying_coins(uint256)"(i: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        virtualPrice(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
