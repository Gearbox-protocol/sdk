import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface IBasicRewardsInterface extends utils.Interface {
    functions: {
        "getReward(address,address)": FunctionFragment;
        "getReward(address,bool)": FunctionFragment;
        "getReward(address)": FunctionFragment;
        "stakeFor(address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getReward(address,address)" | "getReward(address,bool)" | "getReward(address)" | "stakeFor"): FunctionFragment;
    encodeFunctionData(functionFragment: "getReward(address,address)", values: [string, string]): string;
    encodeFunctionData(functionFragment: "getReward(address,bool)", values: [string, boolean]): string;
    encodeFunctionData(functionFragment: "getReward(address)", values: [string]): string;
    encodeFunctionData(functionFragment: "stakeFor", values: [string, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "getReward(address,address)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getReward(address,bool)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getReward(address)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stakeFor", data: BytesLike): Result;
    events: {};
}
export interface IBasicRewards extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IBasicRewardsInterface;
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
        "getReward(address,address)"(_account: string, _token: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        "getReward(address,bool)"(_account: string, _claimExtras: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        "getReward(address)"(_account: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        stakeFor(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
    };
    "getReward(address,address)"(_account: string, _token: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    "getReward(address,bool)"(_account: string, _claimExtras: boolean, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    "getReward(address)"(_account: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    stakeFor(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        "getReward(address,address)"(_account: string, _token: string, overrides?: CallOverrides): Promise<void>;
        "getReward(address,bool)"(_account: string, _claimExtras: boolean, overrides?: CallOverrides): Promise<void>;
        "getReward(address)"(_account: string, overrides?: CallOverrides): Promise<void>;
        stakeFor(arg0: string, arg1: BigNumberish, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        "getReward(address,address)"(_account: string, _token: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        "getReward(address,bool)"(_account: string, _claimExtras: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        "getReward(address)"(_account: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        stakeFor(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        "getReward(address,address)"(_account: string, _token: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        "getReward(address,bool)"(_account: string, _claimExtras: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        "getReward(address)"(_account: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        stakeFor(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
    };
}