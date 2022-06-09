import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../common";
export declare namespace PathFinder {
    type TradePathStruct = {
        path: string[];
        rate: BigNumberish;
        expectedAmount: BigNumberish;
    };
    type TradePathStructOutput = [string[], BigNumber, BigNumber] & {
        path: string[];
        rate: BigNumber;
        expectedAmount: BigNumber;
    };
}
export interface PathFinderInterface extends utils.Interface {
    functions: {
        "addressProvider()": FunctionFragment;
        "bestUniPath(uint8,address,uint256,address,address,uint256,address[])": FunctionFragment;
        "contractsRegister()": FunctionFragment;
        "convertPathToPathV3(address[],uint256)": FunctionFragment;
        "ethToUsdPriceFeed()": FunctionFragment;
        "getClosurePaths(address,address,address,address[])": FunctionFragment;
        "getPrices(address,address[])": FunctionFragment;
        "priceOracle()": FunctionFragment;
        "version()": FunctionFragment;
        "wethToken()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addressProvider" | "bestUniPath" | "contractsRegister" | "convertPathToPathV3" | "ethToUsdPriceFeed" | "getClosurePaths" | "getPrices" | "priceOracle" | "version" | "wethToken"): FunctionFragment;
    encodeFunctionData(functionFragment: "addressProvider", values?: undefined): string;
    encodeFunctionData(functionFragment: "bestUniPath", values: [
        BigNumberish,
        string,
        BigNumberish,
        string,
        string,
        BigNumberish,
        string[]
    ]): string;
    encodeFunctionData(functionFragment: "contractsRegister", values?: undefined): string;
    encodeFunctionData(functionFragment: "convertPathToPathV3", values: [string[], BigNumberish]): string;
    encodeFunctionData(functionFragment: "ethToUsdPriceFeed", values?: undefined): string;
    encodeFunctionData(functionFragment: "getClosurePaths", values: [string, string, string, string[]]): string;
    encodeFunctionData(functionFragment: "getPrices", values: [string, string[]]): string;
    encodeFunctionData(functionFragment: "priceOracle", values?: undefined): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    encodeFunctionData(functionFragment: "wethToken", values?: undefined): string;
    decodeFunctionResult(functionFragment: "addressProvider", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bestUniPath", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "contractsRegister", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "convertPathToPathV3", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ethToUsdPriceFeed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClosurePaths", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPrices", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "priceOracle", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "wethToken", data: BytesLike): Result;
    events: {};
}
export interface PathFinder extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: PathFinderInterface;
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
        addressProvider(overrides?: CallOverrides): Promise<[string]>;
        bestUniPath(swapInterface: BigNumberish, router: string, swapType: BigNumberish, from: string, to: string, amount: BigNumberish, tokens: string[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        contractsRegister(overrides?: CallOverrides): Promise<[string]>;
        convertPathToPathV3(path: string[], swapType: BigNumberish, overrides?: CallOverrides): Promise<[string] & {
            result: string;
        }>;
        ethToUsdPriceFeed(overrides?: CallOverrides): Promise<[string]>;
        getClosurePaths(router: string, _creditManager: string, borrower: string, connectorTokens: string[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        getPrices(creditAccount: string, tokens: string[], overrides?: CallOverrides): Promise<[BigNumber[]] & {
            prices: BigNumber[];
        }>;
        priceOracle(overrides?: CallOverrides): Promise<[string]>;
        version(overrides?: CallOverrides): Promise<[BigNumber]>;
        wethToken(overrides?: CallOverrides): Promise<[string]>;
    };
    addressProvider(overrides?: CallOverrides): Promise<string>;
    bestUniPath(swapInterface: BigNumberish, router: string, swapType: BigNumberish, from: string, to: string, amount: BigNumberish, tokens: string[], overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    contractsRegister(overrides?: CallOverrides): Promise<string>;
    convertPathToPathV3(path: string[], swapType: BigNumberish, overrides?: CallOverrides): Promise<string>;
    ethToUsdPriceFeed(overrides?: CallOverrides): Promise<string>;
    getClosurePaths(router: string, _creditManager: string, borrower: string, connectorTokens: string[], overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    getPrices(creditAccount: string, tokens: string[], overrides?: CallOverrides): Promise<BigNumber[]>;
    priceOracle(overrides?: CallOverrides): Promise<string>;
    version(overrides?: CallOverrides): Promise<BigNumber>;
    wethToken(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        addressProvider(overrides?: CallOverrides): Promise<string>;
        bestUniPath(swapInterface: BigNumberish, router: string, swapType: BigNumberish, from: string, to: string, amount: BigNumberish, tokens: string[], overrides?: CallOverrides): Promise<PathFinder.TradePathStructOutput>;
        contractsRegister(overrides?: CallOverrides): Promise<string>;
        convertPathToPathV3(path: string[], swapType: BigNumberish, overrides?: CallOverrides): Promise<string>;
        ethToUsdPriceFeed(overrides?: CallOverrides): Promise<string>;
        getClosurePaths(router: string, _creditManager: string, borrower: string, connectorTokens: string[], overrides?: CallOverrides): Promise<PathFinder.TradePathStructOutput[]>;
        getPrices(creditAccount: string, tokens: string[], overrides?: CallOverrides): Promise<BigNumber[]>;
        priceOracle(overrides?: CallOverrides): Promise<string>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
        wethToken(overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        addressProvider(overrides?: CallOverrides): Promise<BigNumber>;
        bestUniPath(swapInterface: BigNumberish, router: string, swapType: BigNumberish, from: string, to: string, amount: BigNumberish, tokens: string[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        contractsRegister(overrides?: CallOverrides): Promise<BigNumber>;
        convertPathToPathV3(path: string[], swapType: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        ethToUsdPriceFeed(overrides?: CallOverrides): Promise<BigNumber>;
        getClosurePaths(router: string, _creditManager: string, borrower: string, connectorTokens: string[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        getPrices(creditAccount: string, tokens: string[], overrides?: CallOverrides): Promise<BigNumber>;
        priceOracle(overrides?: CallOverrides): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
        wethToken(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        addressProvider(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        bestUniPath(swapInterface: BigNumberish, router: string, swapType: BigNumberish, from: string, to: string, amount: BigNumberish, tokens: string[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        contractsRegister(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        convertPathToPathV3(path: string[], swapType: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        ethToUsdPriceFeed(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getClosurePaths(router: string, _creditManager: string, borrower: string, connectorTokens: string[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        getPrices(creditAccount: string, tokens: string[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        priceOracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        wethToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
