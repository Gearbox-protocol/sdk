import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IVotingInterface extends utils.Interface {
    functions: {
        "getVote(uint256)": FunctionFragment;
        "vote(uint256,bool,bool)": FunctionFragment;
        "vote_for_gauge_weights(address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getVote" | "vote" | "vote_for_gauge_weights"): FunctionFragment;
    encodeFunctionData(functionFragment: "getVote", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "vote", values: [BigNumberish, boolean, boolean]): string;
    encodeFunctionData(functionFragment: "vote_for_gauge_weights", values: [string, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "getVote", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "vote", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "vote_for_gauge_weights", data: BytesLike): Result;
    events: {};
}
export interface IVoting extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IVotingInterface;
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
        getVote(arg0: BigNumberish, overrides?: CallOverrides): Promise<[
            boolean,
            boolean,
            BigNumber,
            BigNumber,
            BigNumber,
            BigNumber,
            BigNumber,
            BigNumber,
            BigNumber,
            string
        ]>;
        vote(arg0: BigNumberish, arg1: boolean, arg2: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        vote_for_gauge_weights(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
    };
    getVote(arg0: BigNumberish, overrides?: CallOverrides): Promise<[
        boolean,
        boolean,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        string
    ]>;
    vote(arg0: BigNumberish, arg1: boolean, arg2: boolean, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    vote_for_gauge_weights(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        getVote(arg0: BigNumberish, overrides?: CallOverrides): Promise<[
            boolean,
            boolean,
            BigNumber,
            BigNumber,
            BigNumber,
            BigNumber,
            BigNumber,
            BigNumber,
            BigNumber,
            string
        ]>;
        vote(arg0: BigNumberish, arg1: boolean, arg2: boolean, overrides?: CallOverrides): Promise<void>;
        vote_for_gauge_weights(arg0: string, arg1: BigNumberish, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        getVote(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        vote(arg0: BigNumberish, arg1: boolean, arg2: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        vote_for_gauge_weights(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        getVote(arg0: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        vote(arg0: BigNumberish, arg1: boolean, arg2: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        vote_for_gauge_weights(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
    };
}
