import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface UniswapV2MockInterface extends utils.Interface {
    functions: {
        "WETH()": FunctionFragment;
        "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)": FunctionFragment;
        "addLiquidityETH(address,uint256,uint256,uint256,address,uint256)": FunctionFragment;
        "factory()": FunctionFragment;
        "getAmountIn(uint256,uint256,uint256)": FunctionFragment;
        "getAmountOut(uint256,uint256,uint256)": FunctionFragment;
        "getAmountsIn(uint256,address[])": FunctionFragment;
        "getAmountsOut(uint256,address[])": FunctionFragment;
        "getRate(address,address)": FunctionFragment;
        "quote(uint256,uint256,uint256)": FunctionFragment;
        "removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)": FunctionFragment;
        "removeLiquidityETH(address,uint256,uint256,uint256,address,uint256)": FunctionFragment;
        "removeLiquidityETHSupportingFeeOnTransferTokens(address,uint256,uint256,uint256,address,uint256)": FunctionFragment;
        "removeLiquidityETHWithPermit(address,uint256,uint256,uint256,address,uint256,bool,uint8,bytes32,bytes32)": FunctionFragment;
        "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(address,uint256,uint256,uint256,address,uint256,bool,uint8,bytes32,bytes32)": FunctionFragment;
        "removeLiquidityWithPermit(address,address,uint256,uint256,uint256,address,uint256,bool,uint8,bytes32,bytes32)": FunctionFragment;
        "setRate(address,address,uint256)": FunctionFragment;
        "swapETHForExactTokens(uint256,address[],address,uint256)": FunctionFragment;
        "swapExactETHForTokens(uint256,address[],address,uint256)": FunctionFragment;
        "swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)": FunctionFragment;
        "swapExactTokensForETH(uint256,uint256,address[],address,uint256)": FunctionFragment;
        "swapExactTokensForETHSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)": FunctionFragment;
        "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)": FunctionFragment;
        "swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)": FunctionFragment;
        "swapTokensForExactETH(uint256,uint256,address[],address,uint256)": FunctionFragment;
        "swapTokensForExactTokens(uint256,uint256,address[],address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "WETH" | "addLiquidity" | "addLiquidityETH" | "factory" | "getAmountIn" | "getAmountOut" | "getAmountsIn" | "getAmountsOut" | "getRate" | "quote" | "removeLiquidity" | "removeLiquidityETH" | "removeLiquidityETHSupportingFeeOnTransferTokens" | "removeLiquidityETHWithPermit" | "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens" | "removeLiquidityWithPermit" | "setRate" | "swapETHForExactTokens" | "swapExactETHForTokens" | "swapExactETHForTokensSupportingFeeOnTransferTokens" | "swapExactTokensForETH" | "swapExactTokensForETHSupportingFeeOnTransferTokens" | "swapExactTokensForTokens" | "swapExactTokensForTokensSupportingFeeOnTransferTokens" | "swapTokensForExactETH" | "swapTokensForExactTokens"): FunctionFragment;
    encodeFunctionData(functionFragment: "WETH", values?: undefined): string;
    encodeFunctionData(functionFragment: "addLiquidity", values: [
        string,
        string,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        string,
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "addLiquidityETH", values: [
        string,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        string,
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "factory", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAmountIn", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getAmountOut", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getAmountsIn", values: [BigNumberish, string[]]): string;
    encodeFunctionData(functionFragment: "getAmountsOut", values: [BigNumberish, string[]]): string;
    encodeFunctionData(functionFragment: "getRate", values: [string, string]): string;
    encodeFunctionData(functionFragment: "quote", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "removeLiquidity", values: [
        string,
        string,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        string,
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "removeLiquidityETH", values: [
        string,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        string,
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "removeLiquidityETHSupportingFeeOnTransferTokens", values: [
        string,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        string,
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "removeLiquidityETHWithPermit", values: [
        string,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        string,
        BigNumberish,
        boolean,
        BigNumberish,
        BytesLike,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens", values: [
        string,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        string,
        BigNumberish,
        boolean,
        BigNumberish,
        BytesLike,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "removeLiquidityWithPermit", values: [
        string,
        string,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        string,
        BigNumberish,
        boolean,
        BigNumberish,
        BytesLike,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "setRate", values: [string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "swapETHForExactTokens", values: [BigNumberish, string[], string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "swapExactETHForTokens", values: [BigNumberish, string[], string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "swapExactETHForTokensSupportingFeeOnTransferTokens", values: [BigNumberish, string[], string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "swapExactTokensForETH", values: [BigNumberish, BigNumberish, string[], string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "swapExactTokensForETHSupportingFeeOnTransferTokens", values: [BigNumberish, BigNumberish, string[], string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "swapExactTokensForTokens", values: [BigNumberish, BigNumberish, string[], string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "swapExactTokensForTokensSupportingFeeOnTransferTokens", values: [BigNumberish, BigNumberish, string[], string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "swapTokensForExactETH", values: [BigNumberish, BigNumberish, string[], string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "swapTokensForExactTokens", values: [BigNumberish, BigNumberish, string[], string, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "WETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addLiquidity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addLiquidityETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "factory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAmountIn", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAmountOut", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAmountsIn", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAmountsOut", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getRate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "quote", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeLiquidity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeLiquidityETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeLiquidityETHSupportingFeeOnTransferTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeLiquidityETHWithPermit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeLiquidityWithPermit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setRate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapETHForExactTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapExactETHForTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapExactETHForTokensSupportingFeeOnTransferTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapExactTokensForETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapExactTokensForETHSupportingFeeOnTransferTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapExactTokensForTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapExactTokensForTokensSupportingFeeOnTransferTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapTokensForExactETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapTokensForExactTokens", data: BytesLike): Result;
    events: {};
}
export interface UniswapV2Mock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: UniswapV2MockInterface;
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
        WETH(overrides?: CallOverrides): Promise<[string]>;
        addLiquidity(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: BigNumberish, arg6: string, arg7: BigNumberish, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber,
            BigNumber
        ] & {
            amountA: BigNumber;
            amountB: BigNumber;
            liquidity: BigNumber;
        }>;
        addLiquidityETH(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        factory(overrides?: CallOverrides): Promise<[string]>;
        getAmountIn(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber] & {
            amountIn: BigNumber;
        }>;
        getAmountOut(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber] & {
            amountOut: BigNumber;
        }>;
        getAmountsIn(amountOut: BigNumberish, path: string[], overrides?: CallOverrides): Promise<[BigNumber[]] & {
            amounts: BigNumber[];
        }>;
        getAmountsOut(amountIn: BigNumberish, path: string[], overrides?: CallOverrides): Promise<[BigNumber[]] & {
            amounts: BigNumber[];
        }>;
        getRate(tokenIn: string, tokenOut: string, overrides?: CallOverrides): Promise<[BigNumber] & {
            rate: BigNumber;
        }>;
        quote(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber] & {
            amountB: BigNumber;
        }>;
        removeLiquidity(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: string, arg6: BigNumberish, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            amountA: BigNumber;
            amountB: BigNumber;
        }>;
        removeLiquidityETH(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            amountToken: BigNumber;
            amountETH: BigNumber;
        }>;
        removeLiquidityETHSupportingFeeOnTransferTokens(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber] & {
            amountETH: BigNumber;
        }>;
        removeLiquidityETHWithPermit(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, arg6: boolean, arg7: BigNumberish, arg8: BytesLike, arg9: BytesLike, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            amountToken: BigNumber;
            amountETH: BigNumber;
        }>;
        removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, arg6: boolean, arg7: BigNumberish, arg8: BytesLike, arg9: BytesLike, overrides?: CallOverrides): Promise<[BigNumber] & {
            amountETH: BigNumber;
        }>;
        removeLiquidityWithPermit(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: string, arg6: BigNumberish, arg7: boolean, arg8: BigNumberish, arg9: BytesLike, arg10: BytesLike, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            amountA: BigNumber;
            amountB: BigNumber;
        }>;
        setRate(tokenFrom: string, tokenTo: string, rate_RAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        swapETHForExactTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        swapExactETHForTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        swapExactETHForTokensSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        swapExactTokensForETH(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber[]] & {
            amounts: BigNumber[];
        }>;
        swapExactTokensForETHSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<[void]>;
        swapExactTokensForTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        swapExactTokensForTokensSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<[void]>;
        swapTokensForExactETH(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber[]] & {
            amounts: BigNumber[];
        }>;
        swapTokensForExactTokens(amountOut: BigNumberish, amountInMax: BigNumberish, path: string[], to: string, deadline: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
    };
    WETH(overrides?: CallOverrides): Promise<string>;
    addLiquidity(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: BigNumberish, arg6: string, arg7: BigNumberish, overrides?: CallOverrides): Promise<[
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        amountA: BigNumber;
        amountB: BigNumber;
        liquidity: BigNumber;
    }>;
    addLiquidityETH(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    factory(overrides?: CallOverrides): Promise<string>;
    getAmountIn(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getAmountOut(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getAmountsIn(amountOut: BigNumberish, path: string[], overrides?: CallOverrides): Promise<BigNumber[]>;
    getAmountsOut(amountIn: BigNumberish, path: string[], overrides?: CallOverrides): Promise<BigNumber[]>;
    getRate(tokenIn: string, tokenOut: string, overrides?: CallOverrides): Promise<BigNumber>;
    quote(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    removeLiquidity(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: string, arg6: BigNumberish, overrides?: CallOverrides): Promise<[
        BigNumber,
        BigNumber
    ] & {
        amountA: BigNumber;
        amountB: BigNumber;
    }>;
    removeLiquidityETH(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<[
        BigNumber,
        BigNumber
    ] & {
        amountToken: BigNumber;
        amountETH: BigNumber;
    }>;
    removeLiquidityETHSupportingFeeOnTransferTokens(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    removeLiquidityETHWithPermit(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, arg6: boolean, arg7: BigNumberish, arg8: BytesLike, arg9: BytesLike, overrides?: CallOverrides): Promise<[
        BigNumber,
        BigNumber
    ] & {
        amountToken: BigNumber;
        amountETH: BigNumber;
    }>;
    removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, arg6: boolean, arg7: BigNumberish, arg8: BytesLike, arg9: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
    removeLiquidityWithPermit(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: string, arg6: BigNumberish, arg7: boolean, arg8: BigNumberish, arg9: BytesLike, arg10: BytesLike, overrides?: CallOverrides): Promise<[
        BigNumber,
        BigNumber
    ] & {
        amountA: BigNumber;
        amountB: BigNumber;
    }>;
    setRate(tokenFrom: string, tokenTo: string, rate_RAY: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    swapETHForExactTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    swapExactETHForTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    swapExactETHForTokensSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    swapExactTokensForETH(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<BigNumber[]>;
    swapExactTokensForETHSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<void>;
    swapExactTokensForTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    swapExactTokensForTokensSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<void>;
    swapTokensForExactETH(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<BigNumber[]>;
    swapTokensForExactTokens(amountOut: BigNumberish, amountInMax: BigNumberish, path: string[], to: string, deadline: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        WETH(overrides?: CallOverrides): Promise<string>;
        addLiquidity(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: BigNumberish, arg6: string, arg7: BigNumberish, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber,
            BigNumber
        ] & {
            amountA: BigNumber;
            amountB: BigNumber;
            liquidity: BigNumber;
        }>;
        addLiquidityETH(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber,
            BigNumber
        ] & {
            amountToken: BigNumber;
            amountETH: BigNumber;
            liquidity: BigNumber;
        }>;
        factory(overrides?: CallOverrides): Promise<string>;
        getAmountIn(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getAmountOut(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getAmountsIn(amountOut: BigNumberish, path: string[], overrides?: CallOverrides): Promise<BigNumber[]>;
        getAmountsOut(amountIn: BigNumberish, path: string[], overrides?: CallOverrides): Promise<BigNumber[]>;
        getRate(tokenIn: string, tokenOut: string, overrides?: CallOverrides): Promise<BigNumber>;
        quote(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        removeLiquidity(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: string, arg6: BigNumberish, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            amountA: BigNumber;
            amountB: BigNumber;
        }>;
        removeLiquidityETH(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            amountToken: BigNumber;
            amountETH: BigNumber;
        }>;
        removeLiquidityETHSupportingFeeOnTransferTokens(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        removeLiquidityETHWithPermit(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, arg6: boolean, arg7: BigNumberish, arg8: BytesLike, arg9: BytesLike, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            amountToken: BigNumber;
            amountETH: BigNumber;
        }>;
        removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, arg6: boolean, arg7: BigNumberish, arg8: BytesLike, arg9: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        removeLiquidityWithPermit(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: string, arg6: BigNumberish, arg7: boolean, arg8: BigNumberish, arg9: BytesLike, arg10: BytesLike, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            amountA: BigNumber;
            amountB: BigNumber;
        }>;
        setRate(tokenFrom: string, tokenTo: string, rate_RAY: BigNumberish, overrides?: CallOverrides): Promise<void>;
        swapETHForExactTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: CallOverrides): Promise<BigNumber[]>;
        swapExactETHForTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: CallOverrides): Promise<BigNumber[]>;
        swapExactETHForTokensSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: CallOverrides): Promise<void>;
        swapExactTokensForETH(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<BigNumber[]>;
        swapExactTokensForETHSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<void>;
        swapExactTokensForTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, overrides?: CallOverrides): Promise<BigNumber[]>;
        swapExactTokensForTokensSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<void>;
        swapTokensForExactETH(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<BigNumber[]>;
        swapTokensForExactTokens(amountOut: BigNumberish, amountInMax: BigNumberish, path: string[], to: string, deadline: BigNumberish, overrides?: CallOverrides): Promise<BigNumber[]>;
    };
    filters: {};
    estimateGas: {
        WETH(overrides?: CallOverrides): Promise<BigNumber>;
        addLiquidity(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: BigNumberish, arg6: string, arg7: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        addLiquidityETH(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        factory(overrides?: CallOverrides): Promise<BigNumber>;
        getAmountIn(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getAmountOut(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getAmountsIn(amountOut: BigNumberish, path: string[], overrides?: CallOverrides): Promise<BigNumber>;
        getAmountsOut(amountIn: BigNumberish, path: string[], overrides?: CallOverrides): Promise<BigNumber>;
        getRate(tokenIn: string, tokenOut: string, overrides?: CallOverrides): Promise<BigNumber>;
        quote(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        removeLiquidity(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: string, arg6: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        removeLiquidityETH(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        removeLiquidityETHSupportingFeeOnTransferTokens(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        removeLiquidityETHWithPermit(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, arg6: boolean, arg7: BigNumberish, arg8: BytesLike, arg9: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, arg6: boolean, arg7: BigNumberish, arg8: BytesLike, arg9: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        removeLiquidityWithPermit(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: string, arg6: BigNumberish, arg7: boolean, arg8: BigNumberish, arg9: BytesLike, arg10: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        setRate(tokenFrom: string, tokenTo: string, rate_RAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        swapETHForExactTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        swapExactETHForTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        swapExactETHForTokensSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        swapExactTokensForETH(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        swapExactTokensForETHSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        swapExactTokensForTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        swapExactTokensForTokensSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        swapTokensForExactETH(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        swapTokensForExactTokens(amountOut: BigNumberish, amountInMax: BigNumberish, path: string[], to: string, deadline: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        WETH(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        addLiquidity(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: BigNumberish, arg6: string, arg7: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        addLiquidityETH(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        factory(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getAmountIn(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getAmountOut(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getAmountsIn(amountOut: BigNumberish, path: string[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getAmountsOut(amountIn: BigNumberish, path: string[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getRate(tokenIn: string, tokenOut: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        quote(arg0: BigNumberish, arg1: BigNumberish, arg2: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeLiquidity(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: string, arg6: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeLiquidityETH(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeLiquidityETHSupportingFeeOnTransferTokens(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeLiquidityETHWithPermit(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, arg6: boolean, arg7: BigNumberish, arg8: BytesLike, arg9: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(arg0: string, arg1: BigNumberish, arg2: BigNumberish, arg3: BigNumberish, arg4: string, arg5: BigNumberish, arg6: boolean, arg7: BigNumberish, arg8: BytesLike, arg9: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeLiquidityWithPermit(arg0: string, arg1: string, arg2: BigNumberish, arg3: BigNumberish, arg4: BigNumberish, arg5: string, arg6: BigNumberish, arg7: boolean, arg8: BigNumberish, arg9: BytesLike, arg10: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setRate(tokenFrom: string, tokenTo: string, rate_RAY: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        swapETHForExactTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        swapExactETHForTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        swapExactETHForTokensSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: string[], arg2: string, arg3: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        swapExactTokensForETH(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        swapExactTokensForETHSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        swapExactTokensForTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        swapExactTokensForTokensSupportingFeeOnTransferTokens(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        swapTokensForExactETH(arg0: BigNumberish, arg1: BigNumberish, arg2: string[], arg3: string, arg4: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        swapTokensForExactTokens(amountOut: BigNumberish, amountInMax: BigNumberish, path: string[], to: string, deadline: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
    };
}
