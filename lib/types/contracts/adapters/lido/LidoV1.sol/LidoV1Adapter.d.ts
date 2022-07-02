import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface LidoV1AdapterInterface extends utils.Interface {
    functions: {
        "_acl()": FunctionFragment;
        "_gearboxAdapterType()": FunctionFragment;
        "_gearboxAdapterVersion()": FunctionFragment;
        "allowance(address,address)": FunctionFragment;
        "balanceOf(address)": FunctionFragment;
        "creditFacade()": FunctionFragment;
        "creditManager()": FunctionFragment;
        "decimals()": FunctionFragment;
        "getFee()": FunctionFragment;
        "getPooledEthByShares(uint256)": FunctionFragment;
        "getSharesByPooledEth(uint256)": FunctionFragment;
        "getTotalPooledEther()": FunctionFragment;
        "getTotalShares()": FunctionFragment;
        "limit()": FunctionFragment;
        "name()": FunctionFragment;
        "pause()": FunctionFragment;
        "paused()": FunctionFragment;
        "setLimit(uint256)": FunctionFragment;
        "sharesOf(address)": FunctionFragment;
        "stETH()": FunctionFragment;
        "submit(uint256)": FunctionFragment;
        "submitAll()": FunctionFragment;
        "symbol()": FunctionFragment;
        "targetContract()": FunctionFragment;
        "totalSupply()": FunctionFragment;
        "treasury()": FunctionFragment;
        "unpause()": FunctionFragment;
        "weth()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "_acl" | "_gearboxAdapterType" | "_gearboxAdapterVersion" | "allowance" | "balanceOf" | "creditFacade" | "creditManager" | "decimals" | "getFee" | "getPooledEthByShares" | "getSharesByPooledEth" | "getTotalPooledEther" | "getTotalShares" | "limit" | "name" | "pause" | "paused" | "setLimit" | "sharesOf" | "stETH" | "submit" | "submitAll" | "symbol" | "targetContract" | "totalSupply" | "treasury" | "unpause" | "weth"): FunctionFragment;
    encodeFunctionData(functionFragment: "_acl", values?: undefined): string;
    encodeFunctionData(functionFragment: "_gearboxAdapterType", values?: undefined): string;
    encodeFunctionData(functionFragment: "_gearboxAdapterVersion", values?: undefined): string;
    encodeFunctionData(functionFragment: "allowance", values: [string, string]): string;
    encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
    encodeFunctionData(functionFragment: "creditFacade", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
    encodeFunctionData(functionFragment: "getFee", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPooledEthByShares", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getSharesByPooledEth", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getTotalPooledEther", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTotalShares", values?: undefined): string;
    encodeFunctionData(functionFragment: "limit", values?: undefined): string;
    encodeFunctionData(functionFragment: "name", values?: undefined): string;
    encodeFunctionData(functionFragment: "pause", values?: undefined): string;
    encodeFunctionData(functionFragment: "paused", values?: undefined): string;
    encodeFunctionData(functionFragment: "setLimit", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "sharesOf", values: [string]): string;
    encodeFunctionData(functionFragment: "stETH", values?: undefined): string;
    encodeFunctionData(functionFragment: "submit", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "submitAll", values?: undefined): string;
    encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
    encodeFunctionData(functionFragment: "targetContract", values?: undefined): string;
    encodeFunctionData(functionFragment: "totalSupply", values?: undefined): string;
    encodeFunctionData(functionFragment: "treasury", values?: undefined): string;
    encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
    encodeFunctionData(functionFragment: "weth", values?: undefined): string;
    decodeFunctionResult(functionFragment: "_acl", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "_gearboxAdapterType", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "_gearboxAdapterVersion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditFacade", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFee", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPooledEthByShares", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSharesByPooledEth", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalPooledEther", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalShares", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "limit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setLimit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "sharesOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "submit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "submitAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "targetContract", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalSupply", data: BytesLike): Result;
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
        _acl(overrides?: CallOverrides): Promise<[string]>;
        _gearboxAdapterType(overrides?: CallOverrides): Promise<[number]>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<[number]>;
        allowance(_owner: string, _spender: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        balanceOf(_account: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        creditFacade(overrides?: CallOverrides): Promise<[string]>;
        creditManager(overrides?: CallOverrides): Promise<[string]>;
        decimals(overrides?: CallOverrides): Promise<[number]>;
        getFee(overrides?: CallOverrides): Promise<[number]>;
        getPooledEthByShares(_sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        getSharesByPooledEth(_ethAmount: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        getTotalPooledEther(overrides?: CallOverrides): Promise<[BigNumber]>;
        getTotalShares(overrides?: CallOverrides): Promise<[BigNumber]>;
        limit(overrides?: CallOverrides): Promise<[BigNumber]>;
        name(overrides?: CallOverrides): Promise<[string]>;
        pause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        paused(overrides?: CallOverrides): Promise<[boolean]>;
        setLimit(_limit: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        sharesOf(_account: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        stETH(overrides?: CallOverrides): Promise<[string]>;
        submit(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        submitAll(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        symbol(overrides?: CallOverrides): Promise<[string]>;
        targetContract(overrides?: CallOverrides): Promise<[string]>;
        totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;
        treasury(overrides?: CallOverrides): Promise<[string]>;
        unpause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        weth(overrides?: CallOverrides): Promise<[string]>;
    };
    _acl(overrides?: CallOverrides): Promise<string>;
    _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;
    _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;
    allowance(_owner: string, _spender: string, overrides?: CallOverrides): Promise<BigNumber>;
    balanceOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
    creditFacade(overrides?: CallOverrides): Promise<string>;
    creditManager(overrides?: CallOverrides): Promise<string>;
    decimals(overrides?: CallOverrides): Promise<number>;
    getFee(overrides?: CallOverrides): Promise<number>;
    getPooledEthByShares(_sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getSharesByPooledEth(_ethAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getTotalPooledEther(overrides?: CallOverrides): Promise<BigNumber>;
    getTotalShares(overrides?: CallOverrides): Promise<BigNumber>;
    limit(overrides?: CallOverrides): Promise<BigNumber>;
    name(overrides?: CallOverrides): Promise<string>;
    pause(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    paused(overrides?: CallOverrides): Promise<boolean>;
    setLimit(_limit: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    sharesOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
    stETH(overrides?: CallOverrides): Promise<string>;
    submit(amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    submitAll(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    symbol(overrides?: CallOverrides): Promise<string>;
    targetContract(overrides?: CallOverrides): Promise<string>;
    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
    treasury(overrides?: CallOverrides): Promise<string>;
    unpause(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    weth(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        _acl(overrides?: CallOverrides): Promise<string>;
        _gearboxAdapterType(overrides?: CallOverrides): Promise<number>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<number>;
        allowance(_owner: string, _spender: string, overrides?: CallOverrides): Promise<BigNumber>;
        balanceOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
        creditFacade(overrides?: CallOverrides): Promise<string>;
        creditManager(overrides?: CallOverrides): Promise<string>;
        decimals(overrides?: CallOverrides): Promise<number>;
        getFee(overrides?: CallOverrides): Promise<number>;
        getPooledEthByShares(_sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getSharesByPooledEth(_ethAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalPooledEther(overrides?: CallOverrides): Promise<BigNumber>;
        getTotalShares(overrides?: CallOverrides): Promise<BigNumber>;
        limit(overrides?: CallOverrides): Promise<BigNumber>;
        name(overrides?: CallOverrides): Promise<string>;
        pause(overrides?: CallOverrides): Promise<void>;
        paused(overrides?: CallOverrides): Promise<boolean>;
        setLimit(_limit: BigNumberish, overrides?: CallOverrides): Promise<void>;
        sharesOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
        stETH(overrides?: CallOverrides): Promise<string>;
        submit(amount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        submitAll(overrides?: CallOverrides): Promise<BigNumber>;
        symbol(overrides?: CallOverrides): Promise<string>;
        targetContract(overrides?: CallOverrides): Promise<string>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
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
        _acl(overrides?: CallOverrides): Promise<BigNumber>;
        _gearboxAdapterType(overrides?: CallOverrides): Promise<BigNumber>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<BigNumber>;
        allowance(_owner: string, _spender: string, overrides?: CallOverrides): Promise<BigNumber>;
        balanceOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
        creditFacade(overrides?: CallOverrides): Promise<BigNumber>;
        creditManager(overrides?: CallOverrides): Promise<BigNumber>;
        decimals(overrides?: CallOverrides): Promise<BigNumber>;
        getFee(overrides?: CallOverrides): Promise<BigNumber>;
        getPooledEthByShares(_sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getSharesByPooledEth(_ethAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalPooledEther(overrides?: CallOverrides): Promise<BigNumber>;
        getTotalShares(overrides?: CallOverrides): Promise<BigNumber>;
        limit(overrides?: CallOverrides): Promise<BigNumber>;
        name(overrides?: CallOverrides): Promise<BigNumber>;
        pause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        paused(overrides?: CallOverrides): Promise<BigNumber>;
        setLimit(_limit: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        sharesOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
        stETH(overrides?: CallOverrides): Promise<BigNumber>;
        submit(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        submitAll(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        symbol(overrides?: CallOverrides): Promise<BigNumber>;
        targetContract(overrides?: CallOverrides): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        treasury(overrides?: CallOverrides): Promise<BigNumber>;
        unpause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        weth(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        _acl(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        _gearboxAdapterType(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        _gearboxAdapterVersion(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        allowance(_owner: string, _spender: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        balanceOf(_account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditFacade(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getPooledEthByShares(_sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getSharesByPooledEth(_ethAmount: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalPooledEther(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalShares(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        limit(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        name(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        pause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setLimit(_limit: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        sharesOf(_account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stETH(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        submit(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        submitAll(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        targetContract(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        treasury(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        unpause(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        weth(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
