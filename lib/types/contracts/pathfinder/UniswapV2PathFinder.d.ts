import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../common";
export declare type MultiCallStruct = {
    target: string;
    callData: BytesLike;
};
export declare type MultiCallStructOutput = [string, string] & {
    target: string;
    callData: string;
};
export declare type SwapQuoteStruct = {
    multiCall: MultiCallStruct;
    amount: BigNumberish;
    found: boolean;
    gasUsage: BigNumberish;
};
export declare type SwapQuoteStructOutput = [
    MultiCallStructOutput,
    BigNumber,
    boolean,
    BigNumber
] & {
    multiCall: MultiCallStructOutput;
    amount: BigNumber;
    found: boolean;
    gasUsage: BigNumber;
};
export interface UniswapV2PathFinderInterface extends utils.Interface {
    functions: {
        "gasUsage(address,address,address)": FunctionFragment;
        "getBestPairSwap(address,address,address,uint256,uint256)": FunctionFragment;
        "owner()": FunctionFragment;
        "renounceOwnership()": FunctionFragment;
        "setGasUsage(address,address,address,uint256)": FunctionFragment;
        "transferOwnership(address)": FunctionFragment;
        "version()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "gasUsage" | "getBestPairSwap" | "owner" | "renounceOwnership" | "setGasUsage" | "transferOwnership" | "version"): FunctionFragment;
    encodeFunctionData(functionFragment: "gasUsage", values: [string, string, string]): string;
    encodeFunctionData(functionFragment: "getBestPairSwap", values: [string, string, string, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "setGasUsage", values: [string, string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [string]): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    decodeFunctionResult(functionFragment: "gasUsage", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getBestPairSwap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setGasUsage", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    events: {
        "OwnershipTransferred(address,address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}
export interface OwnershipTransferredEventObject {
    previousOwner: string;
    newOwner: string;
}
export declare type OwnershipTransferredEvent = TypedEvent<[
    string,
    string
], OwnershipTransferredEventObject>;
export declare type OwnershipTransferredEventFilter = TypedEventFilter<OwnershipTransferredEvent>;
export interface UniswapV2PathFinder extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: UniswapV2PathFinderInterface;
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
        gasUsage(arg0: string, arg1: string, arg2: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        getBestPairSwap(adapter: string, tokenIn: string, tokenOut: string, amount: BigNumberish, slippageFactor: BigNumberish, overrides?: CallOverrides): Promise<[SwapQuoteStructOutput] & {
            quote: SwapQuoteStructOutput;
        }>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        renounceOwnership(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        setGasUsage(router: string, token0: string, token1: string, usage: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        version(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    gasUsage(arg0: string, arg1: string, arg2: string, overrides?: CallOverrides): Promise<BigNumber>;
    getBestPairSwap(adapter: string, tokenIn: string, tokenOut: string, amount: BigNumberish, slippageFactor: BigNumberish, overrides?: CallOverrides): Promise<SwapQuoteStructOutput>;
    owner(overrides?: CallOverrides): Promise<string>;
    renounceOwnership(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    setGasUsage(router: string, token0: string, token1: string, usage: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    transferOwnership(newOwner: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    version(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        gasUsage(arg0: string, arg1: string, arg2: string, overrides?: CallOverrides): Promise<BigNumber>;
        getBestPairSwap(adapter: string, tokenIn: string, tokenOut: string, amount: BigNumberish, slippageFactor: BigNumberish, overrides?: CallOverrides): Promise<SwapQuoteStructOutput>;
        owner(overrides?: CallOverrides): Promise<string>;
        renounceOwnership(overrides?: CallOverrides): Promise<void>;
        setGasUsage(router: string, token0: string, token1: string, usage: BigNumberish, overrides?: CallOverrides): Promise<void>;
        transferOwnership(newOwner: string, overrides?: CallOverrides): Promise<void>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {
        "OwnershipTransferred(address,address)"(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
        OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
    };
    estimateGas: {
        gasUsage(arg0: string, arg1: string, arg2: string, overrides?: CallOverrides): Promise<BigNumber>;
        getBestPairSwap(adapter: string, tokenIn: string, tokenOut: string, amount: BigNumberish, slippageFactor: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        renounceOwnership(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        setGasUsage(router: string, token0: string, token1: string, usage: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        gasUsage(arg0: string, arg1: string, arg2: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getBestPairSwap(adapter: string, tokenIn: string, tokenOut: string, amount: BigNumberish, slippageFactor: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        setGasUsage(router: string, token0: string, token1: string, usage: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
