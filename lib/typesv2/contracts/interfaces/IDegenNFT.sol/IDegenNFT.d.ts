import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export declare type DegenStruct = {
    degenAddress: string;
    mintBalance: BigNumberish;
};
export declare type DegenStructOutput = [string, number] & {
    degenAddress: string;
    mintBalance: number;
};
export interface IDegenNFTInterface extends utils.Interface {
    functions: {
        "baseURI()": FunctionFragment;
        "limitedEdition()": FunctionFragment;
        "mint(address)": FunctionFragment;
        "mintBalance(address)": FunctionFragment;
        "tokenIndex(address)": FunctionFragment;
        "totalSupply()": FunctionFragment;
        "updateMinters((address,uint8)[])": FunctionFragment;
        "version()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "baseURI" | "limitedEdition" | "mint" | "mintBalance" | "tokenIndex" | "totalSupply" | "updateMinters" | "version"): FunctionFragment;
    encodeFunctionData(functionFragment: "baseURI", values?: undefined): string;
    encodeFunctionData(functionFragment: "limitedEdition", values?: undefined): string;
    encodeFunctionData(functionFragment: "mint", values: [string]): string;
    encodeFunctionData(functionFragment: "mintBalance", values: [string]): string;
    encodeFunctionData(functionFragment: "tokenIndex", values: [string]): string;
    encodeFunctionData(functionFragment: "totalSupply", values?: undefined): string;
    encodeFunctionData(functionFragment: "updateMinters", values: [DegenStruct[]]): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    decodeFunctionResult(functionFragment: "baseURI", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "limitedEdition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mintBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalSupply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateMinters", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    events: {};
}
export interface IDegenNFT extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IDegenNFTInterface;
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
        baseURI(overrides?: CallOverrides): Promise<[string]>;
        limitedEdition(overrides?: CallOverrides): Promise<[boolean]>;
        mint(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        mintBalance(arg0: string, overrides?: CallOverrides): Promise<[number]>;
        tokenIndex(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;
        updateMinters(newDegens: DegenStruct[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        version(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    baseURI(overrides?: CallOverrides): Promise<string>;
    limitedEdition(overrides?: CallOverrides): Promise<boolean>;
    mint(arg0: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    mintBalance(arg0: string, overrides?: CallOverrides): Promise<number>;
    tokenIndex(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
    updateMinters(newDegens: DegenStruct[], overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    version(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        baseURI(overrides?: CallOverrides): Promise<string>;
        limitedEdition(overrides?: CallOverrides): Promise<boolean>;
        mint(arg0: string, overrides?: CallOverrides): Promise<void>;
        mintBalance(arg0: string, overrides?: CallOverrides): Promise<number>;
        tokenIndex(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        updateMinters(newDegens: DegenStruct[], overrides?: CallOverrides): Promise<void>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        baseURI(overrides?: CallOverrides): Promise<BigNumber>;
        limitedEdition(overrides?: CallOverrides): Promise<BigNumber>;
        mint(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        mintBalance(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        tokenIndex(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        updateMinters(newDegens: DegenStruct[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        baseURI(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        limitedEdition(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        mint(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        mintBalance(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokenIndex(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        updateMinters(newDegens: DegenStruct[], overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
