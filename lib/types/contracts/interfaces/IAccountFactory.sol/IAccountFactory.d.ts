import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface IAccountFactoryInterface extends utils.Interface {
    functions: {
        "countCreditAccounts()": FunctionFragment;
        "countCreditAccountsInStock()": FunctionFragment;
        "creditAccounts(uint256)": FunctionFragment;
        "getNext(address)": FunctionFragment;
        "head()": FunctionFragment;
        "returnCreditAccount(address)": FunctionFragment;
        "tail()": FunctionFragment;
        "takeCreditAccount(uint256,uint256)": FunctionFragment;
        "version()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "countCreditAccounts" | "countCreditAccountsInStock" | "creditAccounts" | "getNext" | "head" | "returnCreditAccount" | "tail" | "takeCreditAccount" | "version"): FunctionFragment;
    encodeFunctionData(functionFragment: "countCreditAccounts", values?: undefined): string;
    encodeFunctionData(functionFragment: "countCreditAccountsInStock", values?: undefined): string;
    encodeFunctionData(functionFragment: "creditAccounts", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getNext", values: [string]): string;
    encodeFunctionData(functionFragment: "head", values?: undefined): string;
    encodeFunctionData(functionFragment: "returnCreditAccount", values: [string]): string;
    encodeFunctionData(functionFragment: "tail", values?: undefined): string;
    encodeFunctionData(functionFragment: "takeCreditAccount", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    decodeFunctionResult(functionFragment: "countCreditAccounts", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "countCreditAccountsInStock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditAccounts", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getNext", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "head", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "returnCreditAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tail", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "takeCreditAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    events: {
        "AccountMinerChanged(address)": EventFragment;
        "InitializeCreditAccount(address,address)": EventFragment;
        "NewCreditAccount(address)": EventFragment;
        "ReturnCreditAccount(address)": EventFragment;
        "TakeForever(address,address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AccountMinerChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "InitializeCreditAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewCreditAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ReturnCreditAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TakeForever"): EventFragment;
}
export interface AccountMinerChangedEventObject {
    miner: string;
}
export declare type AccountMinerChangedEvent = TypedEvent<[
    string
], AccountMinerChangedEventObject>;
export declare type AccountMinerChangedEventFilter = TypedEventFilter<AccountMinerChangedEvent>;
export interface InitializeCreditAccountEventObject {
    account: string;
    creditManager: string;
}
export declare type InitializeCreditAccountEvent = TypedEvent<[
    string,
    string
], InitializeCreditAccountEventObject>;
export declare type InitializeCreditAccountEventFilter = TypedEventFilter<InitializeCreditAccountEvent>;
export interface NewCreditAccountEventObject {
    account: string;
}
export declare type NewCreditAccountEvent = TypedEvent<[
    string
], NewCreditAccountEventObject>;
export declare type NewCreditAccountEventFilter = TypedEventFilter<NewCreditAccountEvent>;
export interface ReturnCreditAccountEventObject {
    account: string;
}
export declare type ReturnCreditAccountEvent = TypedEvent<[
    string
], ReturnCreditAccountEventObject>;
export declare type ReturnCreditAccountEventFilter = TypedEventFilter<ReturnCreditAccountEvent>;
export interface TakeForeverEventObject {
    creditAccount: string;
    to: string;
}
export declare type TakeForeverEvent = TypedEvent<[
    string,
    string
], TakeForeverEventObject>;
export declare type TakeForeverEventFilter = TypedEventFilter<TakeForeverEvent>;
export interface IAccountFactory extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IAccountFactoryInterface;
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
        countCreditAccounts(overrides?: CallOverrides): Promise<[BigNumber]>;
        countCreditAccountsInStock(overrides?: CallOverrides): Promise<[BigNumber]>;
        creditAccounts(id: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
        getNext(creditAccount: string, overrides?: CallOverrides): Promise<[string]>;
        head(overrides?: CallOverrides): Promise<[string]>;
        returnCreditAccount(usedAccount: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        tail(overrides?: CallOverrides): Promise<[string]>;
        takeCreditAccount(_borrowedAmount: BigNumberish, _cumulativeIndexAtOpen: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        version(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    countCreditAccounts(overrides?: CallOverrides): Promise<BigNumber>;
    countCreditAccountsInStock(overrides?: CallOverrides): Promise<BigNumber>;
    creditAccounts(id: BigNumberish, overrides?: CallOverrides): Promise<string>;
    getNext(creditAccount: string, overrides?: CallOverrides): Promise<string>;
    head(overrides?: CallOverrides): Promise<string>;
    returnCreditAccount(usedAccount: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    tail(overrides?: CallOverrides): Promise<string>;
    takeCreditAccount(_borrowedAmount: BigNumberish, _cumulativeIndexAtOpen: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    version(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        countCreditAccounts(overrides?: CallOverrides): Promise<BigNumber>;
        countCreditAccountsInStock(overrides?: CallOverrides): Promise<BigNumber>;
        creditAccounts(id: BigNumberish, overrides?: CallOverrides): Promise<string>;
        getNext(creditAccount: string, overrides?: CallOverrides): Promise<string>;
        head(overrides?: CallOverrides): Promise<string>;
        returnCreditAccount(usedAccount: string, overrides?: CallOverrides): Promise<void>;
        tail(overrides?: CallOverrides): Promise<string>;
        takeCreditAccount(_borrowedAmount: BigNumberish, _cumulativeIndexAtOpen: BigNumberish, overrides?: CallOverrides): Promise<string>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {
        "AccountMinerChanged(address)"(miner?: string | null): AccountMinerChangedEventFilter;
        AccountMinerChanged(miner?: string | null): AccountMinerChangedEventFilter;
        "InitializeCreditAccount(address,address)"(account?: string | null, creditManager?: string | null): InitializeCreditAccountEventFilter;
        InitializeCreditAccount(account?: string | null, creditManager?: string | null): InitializeCreditAccountEventFilter;
        "NewCreditAccount(address)"(account?: string | null): NewCreditAccountEventFilter;
        NewCreditAccount(account?: string | null): NewCreditAccountEventFilter;
        "ReturnCreditAccount(address)"(account?: string | null): ReturnCreditAccountEventFilter;
        ReturnCreditAccount(account?: string | null): ReturnCreditAccountEventFilter;
        "TakeForever(address,address)"(creditAccount?: string | null, to?: string | null): TakeForeverEventFilter;
        TakeForever(creditAccount?: string | null, to?: string | null): TakeForeverEventFilter;
    };
    estimateGas: {
        countCreditAccounts(overrides?: CallOverrides): Promise<BigNumber>;
        countCreditAccountsInStock(overrides?: CallOverrides): Promise<BigNumber>;
        creditAccounts(id: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getNext(creditAccount: string, overrides?: CallOverrides): Promise<BigNumber>;
        head(overrides?: CallOverrides): Promise<BigNumber>;
        returnCreditAccount(usedAccount: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        tail(overrides?: CallOverrides): Promise<BigNumber>;
        takeCreditAccount(_borrowedAmount: BigNumberish, _cumulativeIndexAtOpen: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        countCreditAccounts(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        countCreditAccountsInStock(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        creditAccounts(id: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getNext(creditAccount: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        head(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        returnCreditAccount(usedAccount: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        tail(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        takeCreditAccount(_borrowedAmount: BigNumberish, _cumulativeIndexAtOpen: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
