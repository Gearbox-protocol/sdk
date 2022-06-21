import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../common";
export interface ACLInterface extends utils.Interface {
    functions: {
        "addPausableAdmin(address)": FunctionFragment;
        "addUnpausableAdmin(address)": FunctionFragment;
        "isConfigurator(address)": FunctionFragment;
        "isPausableAdmin(address)": FunctionFragment;
        "isUnpausableAdmin(address)": FunctionFragment;
        "owner()": FunctionFragment;
        "pausableAdminSet(address)": FunctionFragment;
        "removePausableAdmin(address)": FunctionFragment;
        "removeUnpausableAdmin(address)": FunctionFragment;
        "renounceOwnership()": FunctionFragment;
        "transferOwnership(address)": FunctionFragment;
        "unpausableAdminSet(address)": FunctionFragment;
        "version()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addPausableAdmin" | "addUnpausableAdmin" | "isConfigurator" | "isPausableAdmin" | "isUnpausableAdmin" | "owner" | "pausableAdminSet" | "removePausableAdmin" | "removeUnpausableAdmin" | "renounceOwnership" | "transferOwnership" | "unpausableAdminSet" | "version"): FunctionFragment;
    encodeFunctionData(functionFragment: "addPausableAdmin", values: [string]): string;
    encodeFunctionData(functionFragment: "addUnpausableAdmin", values: [string]): string;
    encodeFunctionData(functionFragment: "isConfigurator", values: [string]): string;
    encodeFunctionData(functionFragment: "isPausableAdmin", values: [string]): string;
    encodeFunctionData(functionFragment: "isUnpausableAdmin", values: [string]): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "pausableAdminSet", values: [string]): string;
    encodeFunctionData(functionFragment: "removePausableAdmin", values: [string]): string;
    encodeFunctionData(functionFragment: "removeUnpausableAdmin", values: [string]): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [string]): string;
    encodeFunctionData(functionFragment: "unpausableAdminSet", values: [string]): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    decodeFunctionResult(functionFragment: "addPausableAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addUnpausableAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isConfigurator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isPausableAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isUnpausableAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pausableAdminSet", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removePausableAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeUnpausableAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unpausableAdminSet", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    events: {
        "OwnershipTransferred(address,address)": EventFragment;
        "PausableAdminAdded(address)": EventFragment;
        "PausableAdminRemoved(address)": EventFragment;
        "UnpausableAdminAdded(address)": EventFragment;
        "UnpausableAdminRemoved(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PausableAdminAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PausableAdminRemoved"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "UnpausableAdminAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "UnpausableAdminRemoved"): EventFragment;
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
export interface ACL extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ACLInterface;
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
        addPausableAdmin(newAdmin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        addUnpausableAdmin(newAdmin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        isConfigurator(account: string, overrides?: CallOverrides): Promise<[boolean]>;
        isPausableAdmin(addr: string, overrides?: CallOverrides): Promise<[boolean]>;
        isUnpausableAdmin(addr: string, overrides?: CallOverrides): Promise<[boolean]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        pausableAdminSet(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;
        removePausableAdmin(admin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        removeUnpausableAdmin(admin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        unpausableAdminSet(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;
        version(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    addPausableAdmin(newAdmin: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    addUnpausableAdmin(newAdmin: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    isConfigurator(account: string, overrides?: CallOverrides): Promise<boolean>;
    isPausableAdmin(addr: string, overrides?: CallOverrides): Promise<boolean>;
    isUnpausableAdmin(addr: string, overrides?: CallOverrides): Promise<boolean>;
    owner(overrides?: CallOverrides): Promise<string>;
    pausableAdminSet(arg0: string, overrides?: CallOverrides): Promise<boolean>;
    removePausableAdmin(admin: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    removeUnpausableAdmin(admin: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    renounceOwnership(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    transferOwnership(newOwner: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    unpausableAdminSet(arg0: string, overrides?: CallOverrides): Promise<boolean>;
    version(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        addPausableAdmin(newAdmin: string, overrides?: CallOverrides): Promise<void>;
        addUnpausableAdmin(newAdmin: string, overrides?: CallOverrides): Promise<void>;
        isConfigurator(account: string, overrides?: CallOverrides): Promise<boolean>;
        isPausableAdmin(addr: string, overrides?: CallOverrides): Promise<boolean>;
        isUnpausableAdmin(addr: string, overrides?: CallOverrides): Promise<boolean>;
        owner(overrides?: CallOverrides): Promise<string>;
        pausableAdminSet(arg0: string, overrides?: CallOverrides): Promise<boolean>;
        removePausableAdmin(admin: string, overrides?: CallOverrides): Promise<void>;
        removeUnpausableAdmin(admin: string, overrides?: CallOverrides): Promise<void>;
        renounceOwnership(overrides?: CallOverrides): Promise<void>;
        transferOwnership(newOwner: string, overrides?: CallOverrides): Promise<void>;
        unpausableAdminSet(arg0: string, overrides?: CallOverrides): Promise<boolean>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {
        "OwnershipTransferred(address,address)"(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
        OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
        "PausableAdminAdded(address)"(newAdmin?: string | null): PausableAdminAddedEventFilter;
        PausableAdminAdded(newAdmin?: string | null): PausableAdminAddedEventFilter;
        "PausableAdminRemoved(address)"(admin?: string | null): PausableAdminRemovedEventFilter;
        PausableAdminRemoved(admin?: string | null): PausableAdminRemovedEventFilter;
        "UnpausableAdminAdded(address)"(newAdmin?: string | null): UnpausableAdminAddedEventFilter;
        UnpausableAdminAdded(newAdmin?: string | null): UnpausableAdminAddedEventFilter;
        "UnpausableAdminRemoved(address)"(admin?: string | null): UnpausableAdminRemovedEventFilter;
        UnpausableAdminRemoved(admin?: string | null): UnpausableAdminRemovedEventFilter;
    };
    estimateGas: {
        addPausableAdmin(newAdmin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        addUnpausableAdmin(newAdmin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        isConfigurator(account: string, overrides?: CallOverrides): Promise<BigNumber>;
        isPausableAdmin(addr: string, overrides?: CallOverrides): Promise<BigNumber>;
        isUnpausableAdmin(addr: string, overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        pausableAdminSet(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        removePausableAdmin(admin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        removeUnpausableAdmin(admin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        renounceOwnership(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        unpausableAdminSet(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        addPausableAdmin(newAdmin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        addUnpausableAdmin(newAdmin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        isConfigurator(account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isPausableAdmin(addr: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isUnpausableAdmin(addr: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        pausableAdminSet(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removePausableAdmin(admin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        removeUnpausableAdmin(admin: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        unpausableAdminSet(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}