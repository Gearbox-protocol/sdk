import type { BaseContract, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface IAccountFactoryEventsInterface extends utils.Interface {
    functions: {};
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
export interface IAccountFactoryEvents extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IAccountFactoryEventsInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {};
    callStatic: {};
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
    estimateGas: {};
    populateTransaction: {};
}
