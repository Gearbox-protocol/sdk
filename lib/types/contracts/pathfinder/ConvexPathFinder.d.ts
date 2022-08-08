import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../common";
export declare type BalanceStruct = {
    token: string;
    balance: BigNumberish;
};
export declare type BalanceStructOutput = [string, BigNumber] & {
    token: string;
    balance: BigNumber;
};
export declare type MultiCallStruct = {
    target: string;
    callData: BytesLike;
};
export declare type MultiCallStructOutput = [string, string] & {
    target: string;
    callData: string;
};
export interface ConvexPathFinderInterface extends utils.Interface {
    functions: {
        "booster()": FunctionFragment;
        "cvx()": FunctionFragment;
        "filterConvexAdapters(address[])": FunctionFragment;
        "version()": FunctionFragment;
        "withdrawAll(address,(address,uint256)[],address[])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "booster" | "cvx" | "filterConvexAdapters" | "version" | "withdrawAll"): FunctionFragment;
    encodeFunctionData(functionFragment: "booster", values?: undefined): string;
    encodeFunctionData(functionFragment: "cvx", values?: undefined): string;
    encodeFunctionData(functionFragment: "filterConvexAdapters", values: [string[]]): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    encodeFunctionData(functionFragment: "withdrawAll", values: [string, BalanceStruct[], string[]]): string;
    decodeFunctionResult(functionFragment: "booster", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cvx", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "filterConvexAdapters", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawAll", data: BytesLike): Result;
    events: {};
}
export interface ConvexPathFinder extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ConvexPathFinderInterface;
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
        booster(overrides?: CallOverrides): Promise<[string]>;
        cvx(overrides?: CallOverrides): Promise<[string]>;
        filterConvexAdapters(adapters: string[], overrides?: CallOverrides): Promise<[
            string[],
            string
        ] & {
            result: string[];
            boosterAdapter: string;
        }>;
        version(overrides?: CallOverrides): Promise<[BigNumber]>;
        withdrawAll(creditAccount: string, b: BalanceStruct[], adapters: string[], overrides?: CallOverrides): Promise<[BalanceStructOutput[], MultiCallStructOutput[]]>;
    };
    booster(overrides?: CallOverrides): Promise<string>;
    cvx(overrides?: CallOverrides): Promise<string>;
    filterConvexAdapters(adapters: string[], overrides?: CallOverrides): Promise<[string[], string] & {
        result: string[];
        boosterAdapter: string;
    }>;
    version(overrides?: CallOverrides): Promise<BigNumber>;
    withdrawAll(creditAccount: string, b: BalanceStruct[], adapters: string[], overrides?: CallOverrides): Promise<[BalanceStructOutput[], MultiCallStructOutput[]]>;
    callStatic: {
        booster(overrides?: CallOverrides): Promise<string>;
        cvx(overrides?: CallOverrides): Promise<string>;
        filterConvexAdapters(adapters: string[], overrides?: CallOverrides): Promise<[
            string[],
            string
        ] & {
            result: string[];
            boosterAdapter: string;
        }>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
        withdrawAll(creditAccount: string, b: BalanceStruct[], adapters: string[], overrides?: CallOverrides): Promise<[BalanceStructOutput[], MultiCallStructOutput[]]>;
    };
    filters: {};
    estimateGas: {
        booster(overrides?: CallOverrides): Promise<BigNumber>;
        cvx(overrides?: CallOverrides): Promise<BigNumber>;
        filterConvexAdapters(adapters: string[], overrides?: CallOverrides): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
        withdrawAll(creditAccount: string, b: BalanceStruct[], adapters: string[], overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        booster(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        cvx(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        filterConvexAdapters(adapters: string[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        withdrawAll(creditAccount: string, b: BalanceStruct[], adapters: string[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
