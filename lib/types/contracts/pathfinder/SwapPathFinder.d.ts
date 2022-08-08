import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../common";
export declare type SwapTaskStruct = {
    swapOperation: BigNumberish;
    creditAccount: string;
    tokenIn: string;
    tokenOut: string;
    connectors: string[];
    amount: BigNumberish;
    slippage: BigNumberish;
    externalSlippage: boolean;
};
export declare type SwapTaskStructOutput = [
    number,
    string,
    string,
    string,
    string[],
    BigNumber,
    BigNumber,
    boolean
] & {
    swapOperation: number;
    creditAccount: string;
    tokenIn: string;
    tokenOut: string;
    connectors: string[];
    amount: BigNumber;
    slippage: BigNumber;
    externalSlippage: boolean;
};
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
export interface SwapPathFinderInterface extends utils.Interface {
    functions: {
        "curvePathFinder()": FunctionFragment;
        "findAllSwaps((uint8,address,address,address,address[],uint256,uint256,bool),address[])": FunctionFragment;
        "getBestDirectPairSwap((uint8,address,address,address,address[],uint256,uint256,bool),address[],uint256)": FunctionFragment;
        "getPathFinder(address)": FunctionFragment;
        "owner()": FunctionFragment;
        "renounceOwnership()": FunctionFragment;
        "transferOwnership(address)": FunctionFragment;
        "uniV2pathFinder()": FunctionFragment;
        "uniV3pathFinder()": FunctionFragment;
        "version()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "curvePathFinder" | "findAllSwaps" | "getBestDirectPairSwap" | "getPathFinder" | "owner" | "renounceOwnership" | "transferOwnership" | "uniV2pathFinder" | "uniV3pathFinder" | "version"): FunctionFragment;
    encodeFunctionData(functionFragment: "curvePathFinder", values?: undefined): string;
    encodeFunctionData(functionFragment: "findAllSwaps", values: [SwapTaskStruct, string[]]): string;
    encodeFunctionData(functionFragment: "getBestDirectPairSwap", values: [SwapTaskStruct, string[], BigNumberish]): string;
    encodeFunctionData(functionFragment: "getPathFinder", values: [string]): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [string]): string;
    encodeFunctionData(functionFragment: "uniV2pathFinder", values?: undefined): string;
    encodeFunctionData(functionFragment: "uniV3pathFinder", values?: undefined): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    decodeFunctionResult(functionFragment: "curvePathFinder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "findAllSwaps", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getBestDirectPairSwap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPathFinder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uniV2pathFinder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uniV3pathFinder", data: BytesLike): Result;
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
export interface SwapPathFinder extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: SwapPathFinderInterface;
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
        curvePathFinder(overrides?: CallOverrides): Promise<[string]>;
        findAllSwaps(swapTask: SwapTaskStruct, adapters: string[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        getBestDirectPairSwap(swapTask: SwapTaskStruct, adapters: string[], gasPriceInTokenOut: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        getPathFinder(adapter: string, overrides?: CallOverrides): Promise<[string] & {
            pathFinder: string;
        }>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        renounceOwnership(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        uniV2pathFinder(overrides?: CallOverrides): Promise<[string]>;
        uniV3pathFinder(overrides?: CallOverrides): Promise<[string]>;
        version(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    curvePathFinder(overrides?: CallOverrides): Promise<string>;
    findAllSwaps(swapTask: SwapTaskStruct, adapters: string[], overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    getBestDirectPairSwap(swapTask: SwapTaskStruct, adapters: string[], gasPriceInTokenOut: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    getPathFinder(adapter: string, overrides?: CallOverrides): Promise<string>;
    owner(overrides?: CallOverrides): Promise<string>;
    renounceOwnership(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    transferOwnership(newOwner: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    uniV2pathFinder(overrides?: CallOverrides): Promise<string>;
    uniV3pathFinder(overrides?: CallOverrides): Promise<string>;
    version(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        curvePathFinder(overrides?: CallOverrides): Promise<string>;
        findAllSwaps(swapTask: SwapTaskStruct, adapters: string[], overrides?: CallOverrides): Promise<SwapQuoteStructOutput[]>;
        getBestDirectPairSwap(swapTask: SwapTaskStruct, adapters: string[], gasPriceInTokenOut: BigNumberish, overrides?: CallOverrides): Promise<SwapQuoteStructOutput>;
        getPathFinder(adapter: string, overrides?: CallOverrides): Promise<string>;
        owner(overrides?: CallOverrides): Promise<string>;
        renounceOwnership(overrides?: CallOverrides): Promise<void>;
        transferOwnership(newOwner: string, overrides?: CallOverrides): Promise<void>;
        uniV2pathFinder(overrides?: CallOverrides): Promise<string>;
        uniV3pathFinder(overrides?: CallOverrides): Promise<string>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {
        "OwnershipTransferred(address,address)"(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
        OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
    };
    estimateGas: {
        curvePathFinder(overrides?: CallOverrides): Promise<BigNumber>;
        findAllSwaps(swapTask: SwapTaskStruct, adapters: string[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        getBestDirectPairSwap(swapTask: SwapTaskStruct, adapters: string[], gasPriceInTokenOut: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        getPathFinder(adapter: string, overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        renounceOwnership(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        uniV2pathFinder(overrides?: CallOverrides): Promise<BigNumber>;
        uniV3pathFinder(overrides?: CallOverrides): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        curvePathFinder(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        findAllSwaps(swapTask: SwapTaskStruct, adapters: string[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        getBestDirectPairSwap(swapTask: SwapTaskStruct, adapters: string[], gasPriceInTokenOut: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        getPathFinder(adapter: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        uniV2pathFinder(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        uniV3pathFinder(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
