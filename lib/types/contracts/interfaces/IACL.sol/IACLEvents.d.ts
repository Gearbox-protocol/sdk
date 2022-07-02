import type { BaseContract, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface IACLEventsInterface extends utils.Interface {
    functions: {};
    events: {
        "PausableAdminAdded(address)": EventFragment;
        "PausableAdminRemoved(address)": EventFragment;
        "UnpausableAdminAdded(address)": EventFragment;
        "UnpausableAdminRemoved(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "PausableAdminAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PausableAdminRemoved"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "UnpausableAdminAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "UnpausableAdminRemoved"): EventFragment;
}
export interface PausableAdminAddedEventObject {
    newAdmin: string;
}
export declare type PausableAdminAddedEvent = TypedEvent<[
    string
], PausableAdminAddedEventObject>;
export declare type PausableAdminAddedEventFilter = TypedEventFilter<PausableAdminAddedEvent>;
export interface PausableAdminRemovedEventObject {
    admin: string;
}
export declare type PausableAdminRemovedEvent = TypedEvent<[
    string
], PausableAdminRemovedEventObject>;
export declare type PausableAdminRemovedEventFilter = TypedEventFilter<PausableAdminRemovedEvent>;
export interface UnpausableAdminAddedEventObject {
    newAdmin: string;
}
export declare type UnpausableAdminAddedEvent = TypedEvent<[
    string
], UnpausableAdminAddedEventObject>;
export declare type UnpausableAdminAddedEventFilter = TypedEventFilter<UnpausableAdminAddedEvent>;
export interface UnpausableAdminRemovedEventObject {
    admin: string;
}
export declare type UnpausableAdminRemovedEvent = TypedEvent<[
    string
], UnpausableAdminRemovedEventObject>;
export declare type UnpausableAdminRemovedEventFilter = TypedEventFilter<UnpausableAdminRemovedEvent>;
export interface IACLEvents extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IACLEventsInterface;
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
        "PausableAdminAdded(address)"(newAdmin?: string | null): PausableAdminAddedEventFilter;
        PausableAdminAdded(newAdmin?: string | null): PausableAdminAddedEventFilter;
        "PausableAdminRemoved(address)"(admin?: string | null): PausableAdminRemovedEventFilter;
        PausableAdminRemoved(admin?: string | null): PausableAdminRemovedEventFilter;
        "UnpausableAdminAdded(address)"(newAdmin?: string | null): UnpausableAdminAddedEventFilter;
        UnpausableAdminAdded(newAdmin?: string | null): UnpausableAdminAddedEventFilter;
        "UnpausableAdminRemoved(address)"(admin?: string | null): UnpausableAdminRemovedEventFilter;
        UnpausableAdminRemoved(admin?: string | null): UnpausableAdminRemovedEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
