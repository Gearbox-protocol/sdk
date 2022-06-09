import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface IContractsRegisterInterface extends utils.Interface {
    functions: {
        "creditManagers(uint256)": FunctionFragment;
        "getCreditManagers()": FunctionFragment;
        "getCreditManagersCount()": FunctionFragment;
        "getPools()": FunctionFragment;
        "getPoolsCount()": FunctionFragment;
        "isCreditManager(address)": FunctionFragment;
        "isPool(address)": FunctionFragment;
        "pools(uint256)": FunctionFragment;
        "version()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "creditManagers" | "getCreditManagers" | "getCreditManagersCount" | "getPools" | "getPoolsCount" | "isCreditManager" | "isPool" | "pools" | "version"): FunctionFragment;
    encodeFunctionData(functionFragment: "creditManagers", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getCreditManagers", values?: undefined): string;
    encodeFunctionData(functionFragment: "getCreditManagersCount", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPools", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPoolsCount", values?: undefined): string;
    encodeFunctionData(functionFragment: "isCreditManager", values: [string]): string;
    encodeFunctionData(functionFragment: "isPool", values: [string]): string;
    encodeFunctionData(functionFragment: "pools", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    decodeFunctionResult(functionFragment: "creditManagers", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getCreditManagers", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getCreditManagersCount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPools", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPoolsCount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isCreditManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isPool", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pools", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    events: {
        "NewCreditManagerAdded(address)": EventFragment;
        "NewPoolAdded(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "NewCreditManagerAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewPoolAdded"): EventFragment;
}
export interface NewCreditManagerAddedEventObject {
    creditManager: string;
}
export declare type NewCreditManagerAddedEvent = TypedEvent<[
    string
], NewCreditManagerAddedEventObject>;
export declare type NewCreditManagerAddedEventFilter = TypedEventFilter<NewCreditManagerAddedEvent>;
export interface NewPoolAddedEventObject {
    pool: string;
}
export declare type NewPoolAddedEvent = TypedEvent<[string], NewPoolAddedEventObject>;
export declare type NewPoolAddedEventFilter = TypedEventFilter<NewPoolAddedEvent>;
export interface IContractsRegister extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IContractsRegisterInterface;
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
        creditManagers(i: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        getCreditManagers(overrides?: CallOverrides): Promise<[string[]]>;
        getCreditManagersCount(overrides?: CallOverrides): Promise<[BigNumber]>;
        getPools(overrides?: CallOverrides): Promise<[string[]]>;
        getPoolsCount(overrides?: CallOverrides): Promise<[BigNumber]>;
        isCreditManager(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;
        isPool(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;
        pools(i: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        version(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    creditManagers(i: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    getCreditManagers(overrides?: CallOverrides): Promise<string[]>;
    getCreditManagersCount(overrides?: CallOverrides): Promise<BigNumber>;
    getPools(overrides?: CallOverrides): Promise<string[]>;
    getPoolsCount(overrides?: CallOverrides): Promise<BigNumber>;
    isCreditManager(arg0: string, overrides?: CallOverrides): Promise<boolean>;
    isPool(arg0: string, overrides?: CallOverrides): Promise<boolean>;
    pools(i: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    version(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        creditManagers(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
        getCreditManagers(overrides?: CallOverrides): Promise<string[]>;
        getCreditManagersCount(overrides?: CallOverrides): Promise<BigNumber>;
        getPools(overrides?: CallOverrides): Promise<string[]>;
        getPoolsCount(overrides?: CallOverrides): Promise<BigNumber>;
        isCreditManager(arg0: string, overrides?: CallOverrides): Promise<boolean>;
        isPool(arg0: string, overrides?: CallOverrides): Promise<boolean>;
        pools(i: BigNumberish, overrides?: CallOverrides): Promise<string>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {
        "NewCreditManagerAdded(address)"(creditManager?: string | null): NewCreditManagerAddedEventFilter;
        NewCreditManagerAdded(creditManager?: string | null): NewCreditManagerAddedEventFilter;
        "NewPoolAdded(address)"(pool?: string | null): NewPoolAddedEventFilter;
        NewPoolAdded(pool?: string | null): NewPoolAddedEventFilter;
    };
    estimateGas: {
        creditManagers(i: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        getCreditManagers(overrides?: CallOverrides): Promise<BigNumber>;
        getCreditManagersCount(overrides?: CallOverrides): Promise<BigNumber>;
        getPools(overrides?: CallOverrides): Promise<BigNumber>;
        getPoolsCount(overrides?: CallOverrides): Promise<BigNumber>;
        isCreditManager(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        isPool(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        pools(i: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        creditManagers(i: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        getCreditManagers(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getCreditManagersCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getPools(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getPoolsCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isCreditManager(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isPool(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        pools(i: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
