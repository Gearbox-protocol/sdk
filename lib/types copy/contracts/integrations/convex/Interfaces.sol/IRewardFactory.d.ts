import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IRewardFactoryInterface extends utils.Interface {
    functions: {
        "CreateCrvRewards(uint256,address)": FunctionFragment;
        "CreateTokenRewards(address,address,address)": FunctionFragment;
        "activeRewardCount(address)": FunctionFragment;
        "addActiveReward(address,uint256)": FunctionFragment;
        "removeActiveReward(address,uint256)": FunctionFragment;
        "setAccess(address,bool)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "CreateCrvRewards" | "CreateTokenRewards" | "activeRewardCount" | "addActiveReward" | "removeActiveReward" | "setAccess"): FunctionFragment;
    encodeFunctionData(functionFragment: "CreateCrvRewards", values: [BigNumberish, string]): string;
    encodeFunctionData(functionFragment: "CreateTokenRewards", values: [string, string, string]): string;
    encodeFunctionData(functionFragment: "activeRewardCount", values: [string]): string;
    encodeFunctionData(functionFragment: "addActiveReward", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "removeActiveReward", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setAccess", values: [string, boolean]): string;
    decodeFunctionResult(functionFragment: "CreateCrvRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "CreateTokenRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "activeRewardCount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addActiveReward", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeActiveReward", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setAccess", data: BytesLike): Result;
    events: {};
}
export interface IRewardFactory extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IRewardFactoryInterface;
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
        CreateCrvRewards(arg0: BigNumberish, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        CreateTokenRewards(arg0: string, arg1: string, arg2: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        activeRewardCount(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        addActiveReward(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        removeActiveReward(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        setAccess(arg0: string, arg1: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
    };
    CreateCrvRewards(arg0: BigNumberish, arg1: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    CreateTokenRewards(arg0: string, arg1: string, arg2: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    activeRewardCount(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
    addActiveReward(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    removeActiveReward(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    setAccess(arg0: string, arg1: boolean, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        CreateCrvRewards(arg0: BigNumberish, arg1: string, overrides?: CallOverrides): Promise<string>;
        CreateTokenRewards(arg0: string, arg1: string, arg2: string, overrides?: CallOverrides): Promise<string>;
        activeRewardCount(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        addActiveReward(arg0: string, arg1: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        removeActiveReward(arg0: string, arg1: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        setAccess(arg0: string, arg1: boolean, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        CreateCrvRewards(arg0: BigNumberish, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        CreateTokenRewards(arg0: string, arg1: string, arg2: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        activeRewardCount(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        addActiveReward(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        removeActiveReward(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        setAccess(arg0: string, arg1: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        CreateCrvRewards(arg0: BigNumberish, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        CreateTokenRewards(arg0: string, arg1: string, arg2: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        activeRewardCount(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        addActiveReward(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        removeActiveReward(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        setAccess(arg0: string, arg1: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
    };
}
