import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IStakerInterface extends utils.Interface {
    functions: {
        "balanceOfPool(address)": FunctionFragment;
        "claimCrv(address)": FunctionFragment;
        "claimFees(address,address)": FunctionFragment;
        "claimRewards(address)": FunctionFragment;
        "createLock(uint256,uint256)": FunctionFragment;
        "deposit(address,address)": FunctionFragment;
        "execute(address,uint256,bytes)": FunctionFragment;
        "increaseAmount(uint256)": FunctionFragment;
        "increaseTime(uint256)": FunctionFragment;
        "operator()": FunctionFragment;
        "release()": FunctionFragment;
        "setStashAccess(address,bool)": FunctionFragment;
        "vote(uint256,address,bool)": FunctionFragment;
        "voteGaugeWeight(address,uint256)": FunctionFragment;
        "withdraw(address)": FunctionFragment;
        "withdraw(address,address,uint256)": FunctionFragment;
        "withdrawAll(address,address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "balanceOfPool" | "claimCrv" | "claimFees" | "claimRewards" | "createLock" | "deposit" | "execute" | "increaseAmount" | "increaseTime" | "operator" | "release" | "setStashAccess" | "vote" | "voteGaugeWeight" | "withdraw(address)" | "withdraw(address,address,uint256)" | "withdrawAll"): FunctionFragment;
    encodeFunctionData(functionFragment: "balanceOfPool", values: [string]): string;
    encodeFunctionData(functionFragment: "claimCrv", values: [string]): string;
    encodeFunctionData(functionFragment: "claimFees", values: [string, string]): string;
    encodeFunctionData(functionFragment: "claimRewards", values: [string]): string;
    encodeFunctionData(functionFragment: "createLock", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "deposit", values: [string, string]): string;
    encodeFunctionData(functionFragment: "execute", values: [string, BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "increaseAmount", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "increaseTime", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "operator", values?: undefined): string;
    encodeFunctionData(functionFragment: "release", values?: undefined): string;
    encodeFunctionData(functionFragment: "setStashAccess", values: [string, boolean]): string;
    encodeFunctionData(functionFragment: "vote", values: [BigNumberish, string, boolean]): string;
    encodeFunctionData(functionFragment: "voteGaugeWeight", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "withdraw(address)", values: [string]): string;
    encodeFunctionData(functionFragment: "withdraw(address,address,uint256)", values: [string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "withdrawAll", values: [string, string]): string;
    decodeFunctionResult(functionFragment: "balanceOfPool", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimCrv", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimFees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createLock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "execute", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "increaseAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "increaseTime", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "operator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "release", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setStashAccess", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "vote", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "voteGaugeWeight", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw(address)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw(address,address,uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawAll", data: BytesLike): Result;
    events: {};
}
export interface IStaker extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IStakerInterface;
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
        balanceOfPool(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        claimCrv(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        claimFees(arg0: string, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        claimRewards(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        createLock(arg0: BigNumberish, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        deposit(arg0: string, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        execute(_to: string, _value: BigNumberish, _data: BytesLike, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        increaseAmount(arg0: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        increaseTime(arg0: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        operator(overrides?: CallOverrides): Promise<[string]>;
        release(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        setStashAccess(arg0: string, arg1: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        vote(arg0: BigNumberish, arg1: string, arg2: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        voteGaugeWeight(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        "withdraw(address)"(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        "withdraw(address,address,uint256)"(arg0: string, arg1: string, arg2: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        withdrawAll(arg0: string, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
    };
    balanceOfPool(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
    claimCrv(arg0: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    claimFees(arg0: string, arg1: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    claimRewards(arg0: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    createLock(arg0: BigNumberish, arg1: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    deposit(arg0: string, arg1: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    execute(_to: string, _value: BigNumberish, _data: BytesLike, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    increaseAmount(arg0: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    increaseTime(arg0: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    operator(overrides?: CallOverrides): Promise<string>;
    release(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    setStashAccess(arg0: string, arg1: boolean, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    vote(arg0: BigNumberish, arg1: string, arg2: boolean, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    voteGaugeWeight(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    "withdraw(address)"(arg0: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    "withdraw(address,address,uint256)"(arg0: string, arg1: string, arg2: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    withdrawAll(arg0: string, arg1: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        balanceOfPool(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        claimCrv(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        claimFees(arg0: string, arg1: string, overrides?: CallOverrides): Promise<void>;
        claimRewards(arg0: string, overrides?: CallOverrides): Promise<void>;
        createLock(arg0: BigNumberish, arg1: BigNumberish, overrides?: CallOverrides): Promise<void>;
        deposit(arg0: string, arg1: string, overrides?: CallOverrides): Promise<void>;
        execute(_to: string, _value: BigNumberish, _data: BytesLike, overrides?: CallOverrides): Promise<[boolean, string]>;
        increaseAmount(arg0: BigNumberish, overrides?: CallOverrides): Promise<void>;
        increaseTime(arg0: BigNumberish, overrides?: CallOverrides): Promise<void>;
        operator(overrides?: CallOverrides): Promise<string>;
        release(overrides?: CallOverrides): Promise<void>;
        setStashAccess(arg0: string, arg1: boolean, overrides?: CallOverrides): Promise<void>;
        vote(arg0: BigNumberish, arg1: string, arg2: boolean, overrides?: CallOverrides): Promise<void>;
        voteGaugeWeight(arg0: string, arg1: BigNumberish, overrides?: CallOverrides): Promise<void>;
        "withdraw(address)"(arg0: string, overrides?: CallOverrides): Promise<void>;
        "withdraw(address,address,uint256)"(arg0: string, arg1: string, arg2: BigNumberish, overrides?: CallOverrides): Promise<void>;
        withdrawAll(arg0: string, arg1: string, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        balanceOfPool(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        claimCrv(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        claimFees(arg0: string, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        claimRewards(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        createLock(arg0: BigNumberish, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        deposit(arg0: string, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        execute(_to: string, _value: BigNumberish, _data: BytesLike, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        increaseAmount(arg0: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        increaseTime(arg0: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        operator(overrides?: CallOverrides): Promise<BigNumber>;
        release(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        setStashAccess(arg0: string, arg1: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        vote(arg0: BigNumberish, arg1: string, arg2: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        voteGaugeWeight(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        "withdraw(address)"(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        "withdraw(address,address,uint256)"(arg0: string, arg1: string, arg2: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        withdrawAll(arg0: string, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        balanceOfPool(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        claimCrv(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        claimFees(arg0: string, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        claimRewards(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        createLock(arg0: BigNumberish, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        deposit(arg0: string, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        execute(_to: string, _value: BigNumberish, _data: BytesLike, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        increaseAmount(arg0: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        increaseTime(arg0: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        operator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        release(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        setStashAccess(arg0: string, arg1: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        vote(arg0: BigNumberish, arg1: string, arg2: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        voteGaugeWeight(arg0: string, arg1: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        "withdraw(address)"(arg0: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        "withdraw(address,address,uint256)"(arg0: string, arg1: string, arg2: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        withdrawAll(arg0: string, arg1: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
    };
}
