import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../common";
export declare type BalanceStruct = {
    token: string;
    balance: BigNumberish;
};
export declare type BalanceStructOutput = [string, BigNumber] & {
    token: string;
    balance: BigNumber;
};
export interface ConvexPathFinderInterface extends utils.Interface {
    functions: {
        "booster()": FunctionFragment;
        "calcRewards(address,uint256[])": FunctionFragment;
        "cvx()": FunctionFragment;
        "version()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "booster" | "calcRewards" | "cvx" | "version"): FunctionFragment;
    encodeFunctionData(functionFragment: "booster", values?: undefined): string;
    encodeFunctionData(functionFragment: "calcRewards", values: [string, BigNumberish[]]): string;
    encodeFunctionData(functionFragment: "cvx", values?: undefined): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    decodeFunctionResult(functionFragment: "booster", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "calcRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cvx", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    events: {};
}
export interface ConvexPathFinder extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ConvexPathFinderInterface;
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
        booster(overrides?: CallOverrides): Promise<[string]>;
        calcRewards(creditAccount: string, pids: BigNumberish[], overrides?: CallOverrides): Promise<[BalanceStructOutput[]]>;
        cvx(overrides?: CallOverrides): Promise<[string]>;
        version(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    booster(overrides?: CallOverrides): Promise<string>;
    calcRewards(creditAccount: string, pids: BigNumberish[], overrides?: CallOverrides): Promise<BalanceStructOutput[]>;
    cvx(overrides?: CallOverrides): Promise<string>;
    version(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        booster(overrides?: CallOverrides): Promise<string>;
        calcRewards(creditAccount: string, pids: BigNumberish[], overrides?: CallOverrides): Promise<BalanceStructOutput[]>;
        cvx(overrides?: CallOverrides): Promise<string>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        booster(overrides?: CallOverrides): Promise<BigNumber>;
        calcRewards(creditAccount: string, pids: BigNumberish[], overrides?: CallOverrides): Promise<BigNumber>;
        cvx(overrides?: CallOverrides): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        booster(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        calcRewards(creditAccount: string, pids: BigNumberish[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        cvx(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
