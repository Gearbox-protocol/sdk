import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface ClaimZapFormatterInterface extends utils.Interface {
    functions: {
        "claimRewards(address[],address[],address[],address[],uint256,uint256,uint256,uint256,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "claimRewards"): FunctionFragment;
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
    decodeFunctionResult(functionFragment: "claimRewards", data: BytesLike): Result;
    events: {};
}
export interface ClaimZapFormatter extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ClaimZapFormatterInterface;
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
        claimRewards(rewardContracts: string[], extraRewardContracts: string[], tokenRewardContracts: string[], tokenRewardTokens: string[], depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
    };
    claimRewards(rewardContracts: string[], extraRewardContracts: string[], tokenRewardContracts: string[], tokenRewardTokens: string[], depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish, overrides?: CallOverrides): Promise<string>;
    callStatic: {
        claimRewards(rewardContracts: string[], extraRewardContracts: string[], tokenRewardContracts: string[], tokenRewardTokens: string[], depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish, overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        claimRewards(rewardContracts: string[], extraRewardContracts: string[], tokenRewardContracts: string[], tokenRewardTokens: string[], depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        claimRewards(rewardContracts: string[], extraRewardContracts: string[], tokenRewardContracts: string[], tokenRewardTokens: string[], depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
