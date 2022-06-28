import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface ClaimZapMockInterface extends utils.Interface {
    functions: {
        "claimRewards(address[],address[],address[],address[],uint256,uint256,uint256,uint256,uint256)": FunctionFragment;
        "crv()": FunctionFragment;
        "cvx()": FunctionFragment;
        "getName()": FunctionFragment;
        "owner()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "claimRewards" | "crv" | "cvx" | "getName" | "owner"): FunctionFragment;
    encodeFunctionData(functionFragment: "claimRewards", values: [
        string[],
        string[],
        string[],
        string[],
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "crv", values?: undefined): string;
    encodeFunctionData(functionFragment: "cvx", values?: undefined): string;
    encodeFunctionData(functionFragment: "getName", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    decodeFunctionResult(functionFragment: "claimRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "crv", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cvx", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getName", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    events: {};
}
export interface ClaimZapMock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ClaimZapMockInterface;
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
        claimRewards(rewardContracts: string[], extraRewardContracts: string[], arg2: string[], arg3: string[], depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        crv(overrides?: CallOverrides): Promise<[string]>;
        cvx(overrides?: CallOverrides): Promise<[string]>;
        getName(overrides?: CallOverrides): Promise<[string]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
    };
    claimRewards(rewardContracts: string[], extraRewardContracts: string[], arg2: string[], arg3: string[], depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    crv(overrides?: CallOverrides): Promise<string>;
    cvx(overrides?: CallOverrides): Promise<string>;
    getName(overrides?: CallOverrides): Promise<string>;
    owner(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        claimRewards(rewardContracts: string[], extraRewardContracts: string[], arg2: string[], arg3: string[], depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish, overrides?: CallOverrides): Promise<void>;
        crv(overrides?: CallOverrides): Promise<string>;
        cvx(overrides?: CallOverrides): Promise<string>;
        getName(overrides?: CallOverrides): Promise<string>;
        owner(overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        claimRewards(rewardContracts: string[], extraRewardContracts: string[], arg2: string[], arg3: string[], depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        crv(overrides?: CallOverrides): Promise<BigNumber>;
        cvx(overrides?: CallOverrides): Promise<BigNumber>;
        getName(overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        claimRewards(rewardContracts: string[], extraRewardContracts: string[], arg2: string[], arg3: string[], depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        crv(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        cvx(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getName(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
