import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface LidoV1AdapterInterface extends utils.Interface {
    functions: {
        "_gearboxAdapterType()": FunctionFragment;
        "_gearboxAdapterVersion()": FunctionFragment;
        "creditFacade()": FunctionFragment;
        "creditManager()": FunctionFragment;
        "limit()": FunctionFragment;
        "pause()": FunctionFragment;
        "paused()": FunctionFragment;
        "setLimit(uint256)": FunctionFragment;
        "stETH()": FunctionFragment;
        "submit(uint256)": FunctionFragment;
        "targetContract()": FunctionFragment;
        "treasury()": FunctionFragment;
        "unpause()": FunctionFragment;
        "weth()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "_gearboxAdapterType" | "_gearboxAdapterVersion" | "creditFacade" | "creditManager" | "limit" | "pause" | "paused" | "setLimit" | "stETH" | "submit" | "targetContract" | "treasury" | "unpause" | "weth"): FunctionFragment;
    encodeFunctionData(functionFragment: "_gearboxAdapterType", values?: undefined): string;
    encodeFunctionData(functionFragment: "_gearboxAdapterVersion", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditFacade", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "limit", values?: undefined): string;
    encodeFunctionData(functionFragment: "pause", values?: undefined): string;
    encodeFunctionData(functionFragment: "paused", values?: undefined): string;
    encodeFunctionData(functionFragment: "setLimit", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "stETH", values?: undefined): string;
    encodeFunctionData(functionFragment: "submit", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "targetContract", values?: undefined): string;
    encodeFunctionData(functionFragment: "treasury", values?: undefined): string;
    encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
    encodeFunctionData(functionFragment: "weth", values?: undefined): string;
    decodeFunctionResult(functionFragment: "_gearboxAdapterType", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "_gearboxAdapterVersion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditFacade", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "limit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setLimit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "submit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "targetContract", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "treasury", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "weth", data: BytesLike): Result;
    events: {
        "NewLimit(uint256)": EventFragment;
        "Paused(address)": EventFragment;
        "Unpaused(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "NewLimit"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
}
export interface NewLimitEventObject {
    _limit: BigNumber;
}
export declare type NewLimitEvent = TypedEvent<[BigNumber], NewLimitEventObject>;
export declare type NewLimitEventFilter = TypedEventFilter<NewLimitEvent>;
export interface PausedEventObject {
    account: string;
}
export declare type PausedEvent = TypedEvent<[string], PausedEventObject>;
export declare type PausedEventFilter = TypedEventFilter<PausedEvent>;
export interface UnpausedEventObject {
    account: string;
}
export declare type UnpausedEvent = TypedEvent<[string], UnpausedEventObject>;
export declare type UnpausedEventFilter = TypedEventFilter<UnpausedEvent>;
export interface LidoV1Adapter extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: LidoV1AdapterInterface;
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
        creditFacade(overrides?: CallOverrides): Promise<[string]>;
        creditManager(overrides?: CallOverrides): Promise<[string]>;
        limit(overrides?: CallOverrides): Promise<[BigNumber]>;
        pause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        paused(overrides?: CallOverrides): Promise<[boolean]>;
        setLimit(_limit: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        stETH(overrides?: CallOverrides): Promise<[string]>;
        submit(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        targetContract(overrides?: CallOverrides): Promise<[string]>;
        treasury(overrides?: CallOverrides): Promise<[string]>;
        unpause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        weth(overrides?: CallOverrides): Promise<[string]>;
    };
    _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;
    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;
    creditFacade(overrides?: CallOverrides): Promise<string>;
    creditManager(overrides?: CallOverrides): Promise<string>;
    limit(overrides?: CallOverrides): Promise<BigNumber>;
    pause(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    paused(overrides?: CallOverrides): Promise<boolean>;
    setLimit(_limit: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    stETH(overrides?: CallOverrides): Promise<string>;
    submit(amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    targetContract(overrides?: CallOverrides): Promise<string>;
    treasury(overrides?: CallOverrides): Promise<string>;
    unpause(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    weth(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;
        creditFacade(overrides?: CallOverrides): Promise<string>;
        creditManager(overrides?: CallOverrides): Promise<string>;
        limit(overrides?: CallOverrides): Promise<BigNumber>;
        pause(overrides?: CallOverrides): Promise<void>;
        paused(overrides?: CallOverrides): Promise<boolean>;
        setLimit(_limit: BigNumberish, overrides?: CallOverrides): Promise<void>;
        stETH(overrides?: CallOverrides): Promise<string>;
        submit(amount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        targetContract(overrides?: CallOverrides): Promise<string>;
        treasury(overrides?: CallOverrides): Promise<string>;
        unpause(overrides?: CallOverrides): Promise<void>;
        weth(overrides?: CallOverrides): Promise<string>;
    };
    filters: {
        "NewLimit(uint256)"(_limit?: null): NewLimitEventFilter;
        NewLimit(_limit?: null): NewLimitEventFilter;
        "Paused(address)"(account?: null): PausedEventFilter;
        Paused(account?: null): PausedEventFilter;
        "Unpaused(address)"(account?: null): UnpausedEventFilter;
        Unpaused(account?: null): UnpausedEventFilter;
    };
    estimateGas: {
        _gearboxAdapterType(overrides?: CallOverrides): Promise<BigNumber>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<BigNumber>;
        creditFacade(overrides?: CallOverrides): Promise<BigNumber>;
        creditManager(overrides?: CallOverrides): Promise<BigNumber>;
        limit(overrides?: CallOverrides): Promise<BigNumber>;
        pause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        paused(overrides?: CallOverrides): Promise<BigNumber>;
        setLimit(_limit: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        stETH(overrides?: CallOverrides): Promise<BigNumber>;
        submit(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        targetContract(overrides?: CallOverrides): Promise<BigNumber>;
        treasury(overrides?: CallOverrides): Promise<BigNumber>;
        unpause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        weth(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        _gearboxAdapterType(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditFacade(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        limit(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        pause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setLimit(_limit: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        stETH(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        submit(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        targetContract(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        treasury(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        unpause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        weth(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}