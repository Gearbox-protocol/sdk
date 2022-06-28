import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface ExtraRewardPoolMockInterface extends utils.Interface {
    functions: {
        "addRewardAmount(uint256)": FunctionFragment;
        "balanceOf(address)": FunctionFragment;
        "currentRewards()": FunctionFragment;
        "deposits()": FunctionFragment;
        "donate(uint256)": FunctionFragment;
        "duration()": FunctionFragment;
        "earned(address)": FunctionFragment;
        "getReward()": FunctionFragment;
        "getReward(address)": FunctionFragment;
        "historicalRewards()": FunctionFragment;
        "lastUpdateTime()": FunctionFragment;
        "newRewardRatio()": FunctionFragment;
        "operator()": FunctionFragment;
        "periodFinish()": FunctionFragment;
        "queueNewRewards(uint256)": FunctionFragment;
        "queuedRewards()": FunctionFragment;
        "rewardPerToken()": FunctionFragment;
        "rewardPerTokenStored()": FunctionFragment;
        "rewardRate()": FunctionFragment;
        "rewardToken()": FunctionFragment;
        "rewards(address)": FunctionFragment;
        "stake(address,uint256)": FunctionFragment;
        "totalSupply()": FunctionFragment;
        "userRewardPerTokenPaid(address)": FunctionFragment;
        "withdraw(address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addRewardAmount" | "balanceOf" | "currentRewards" | "deposits" | "donate" | "duration" | "earned" | "getReward()" | "getReward(address)" | "historicalRewards" | "lastUpdateTime" | "newRewardRatio" | "operator" | "periodFinish" | "queueNewRewards" | "queuedRewards" | "rewardPerToken" | "rewardPerTokenStored" | "rewardRate" | "rewardToken" | "rewards" | "stake" | "totalSupply" | "userRewardPerTokenPaid" | "withdraw"): FunctionFragment;
    encodeFunctionData(functionFragment: "addRewardAmount", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
    encodeFunctionData(functionFragment: "currentRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "deposits", values?: undefined): string;
    encodeFunctionData(functionFragment: "donate", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "duration", values?: undefined): string;
    encodeFunctionData(functionFragment: "earned", values: [string]): string;
    encodeFunctionData(functionFragment: "getReward()", values?: undefined): string;
    encodeFunctionData(functionFragment: "getReward(address)", values: [string]): string;
    encodeFunctionData(functionFragment: "historicalRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "lastUpdateTime", values?: undefined): string;
    encodeFunctionData(functionFragment: "newRewardRatio", values?: undefined): string;
    encodeFunctionData(functionFragment: "operator", values?: undefined): string;
    encodeFunctionData(functionFragment: "periodFinish", values?: undefined): string;
    encodeFunctionData(functionFragment: "queueNewRewards", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "queuedRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardPerToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardPerTokenStored", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardRate", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewards", values: [string]): string;
    encodeFunctionData(functionFragment: "stake", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "totalSupply", values?: undefined): string;
    encodeFunctionData(functionFragment: "userRewardPerTokenPaid", values: [string]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [string, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "addRewardAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "currentRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deposits", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "donate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "duration", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "earned", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getReward()", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getReward(address)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "historicalRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lastUpdateTime", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "newRewardRatio", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "operator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "periodFinish", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "queueNewRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "queuedRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardPerToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardPerTokenStored", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardRate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stake", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalSupply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "userRewardPerTokenPaid", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    events: {
        "Mock_ExtraRewardPaid(uint256,address,uint256)": EventFragment;
        "Mock_ExtraStaked(uint256,address,uint256)": EventFragment;
        "Mock_ExtraWithdrawn(uint256,address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Mock_ExtraRewardPaid"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Mock_ExtraStaked"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Mock_ExtraWithdrawn"): EventFragment;
}
export interface Mock_ExtraRewardPaidEventObject {
    index: BigNumber;
    user: string;
    reward: BigNumber;
}
export declare type Mock_ExtraRewardPaidEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber
], Mock_ExtraRewardPaidEventObject>;
export declare type Mock_ExtraRewardPaidEventFilter = TypedEventFilter<Mock_ExtraRewardPaidEvent>;
export interface Mock_ExtraStakedEventObject {
    index: BigNumber;
    user: string;
    amount: BigNumber;
}
export declare type Mock_ExtraStakedEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber
], Mock_ExtraStakedEventObject>;
export declare type Mock_ExtraStakedEventFilter = TypedEventFilter<Mock_ExtraStakedEvent>;
export interface Mock_ExtraWithdrawnEventObject {
    index: BigNumber;
    user: string;
    amount: BigNumber;
}
export declare type Mock_ExtraWithdrawnEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber
], Mock_ExtraWithdrawnEventObject>;
export declare type Mock_ExtraWithdrawnEventFilter = TypedEventFilter<Mock_ExtraWithdrawnEvent>;
export interface ExtraRewardPoolMock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ExtraRewardPoolMockInterface;
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
        addRewardAmount(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        balanceOf(account: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        currentRewards(overrides?: CallOverrides): Promise<[BigNumber]>;
        deposits(overrides?: CallOverrides): Promise<[string]>;
        donate(arg0: BigNumberish, overrides?: CallOverrides): Promise<[boolean]>;
        duration(overrides?: CallOverrides): Promise<[BigNumber]>;
        earned(account: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        "getReward()"(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        "getReward(address)"(_account: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        historicalRewards(overrides?: CallOverrides): Promise<[BigNumber]>;
        lastUpdateTime(overrides?: CallOverrides): Promise<[BigNumber]>;
        newRewardRatio(overrides?: CallOverrides): Promise<[BigNumber]>;
        operator(overrides?: CallOverrides): Promise<[string]>;
        periodFinish(overrides?: CallOverrides): Promise<[BigNumber]>;
        queueNewRewards(arg0: BigNumberish, overrides?: CallOverrides): Promise<[boolean]>;
        queuedRewards(overrides?: CallOverrides): Promise<[BigNumber]>;
        rewardPerToken(overrides?: CallOverrides): Promise<[BigNumber]>;
        rewardPerTokenStored(overrides?: CallOverrides): Promise<[BigNumber]>;
        rewardRate(overrides?: CallOverrides): Promise<[BigNumber]>;
        rewardToken(overrides?: CallOverrides): Promise<[string]>;
        rewards(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        stake(_account: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;
        userRewardPerTokenPaid(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        withdraw(_account: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
    };
    addRewardAmount(amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;
    currentRewards(overrides?: CallOverrides): Promise<BigNumber>;
    deposits(overrides?: CallOverrides): Promise<string>;
    donate(arg0: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    duration(overrides?: CallOverrides): Promise<BigNumber>;
    earned(account: string, overrides?: CallOverrides): Promise<BigNumber>;
    "getReward()"(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    "getReward(address)"(_account: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    historicalRewards(overrides?: CallOverrides): Promise<BigNumber>;
    lastUpdateTime(overrides?: CallOverrides): Promise<BigNumber>;
    newRewardRatio(overrides?: CallOverrides): Promise<BigNumber>;
    operator(overrides?: CallOverrides): Promise<string>;
    periodFinish(overrides?: CallOverrides): Promise<BigNumber>;
    queueNewRewards(arg0: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    queuedRewards(overrides?: CallOverrides): Promise<BigNumber>;
    rewardPerToken(overrides?: CallOverrides): Promise<BigNumber>;
    rewardPerTokenStored(overrides?: CallOverrides): Promise<BigNumber>;
    rewardRate(overrides?: CallOverrides): Promise<BigNumber>;
    rewardToken(overrides?: CallOverrides): Promise<string>;
    rewards(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
    stake(_account: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
    userRewardPerTokenPaid(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
    withdraw(_account: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        addRewardAmount(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;
        currentRewards(overrides?: CallOverrides): Promise<BigNumber>;
        deposits(overrides?: CallOverrides): Promise<string>;
        donate(arg0: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        duration(overrides?: CallOverrides): Promise<BigNumber>;
        earned(account: string, overrides?: CallOverrides): Promise<BigNumber>;
        "getReward()"(overrides?: CallOverrides): Promise<boolean>;
        "getReward(address)"(_account: string, overrides?: CallOverrides): Promise<boolean>;
        historicalRewards(overrides?: CallOverrides): Promise<BigNumber>;
        lastUpdateTime(overrides?: CallOverrides): Promise<BigNumber>;
        newRewardRatio(overrides?: CallOverrides): Promise<BigNumber>;
        operator(overrides?: CallOverrides): Promise<string>;
        periodFinish(overrides?: CallOverrides): Promise<BigNumber>;
        queueNewRewards(arg0: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        queuedRewards(overrides?: CallOverrides): Promise<BigNumber>;
        rewardPerToken(overrides?: CallOverrides): Promise<BigNumber>;
        rewardPerTokenStored(overrides?: CallOverrides): Promise<BigNumber>;
        rewardRate(overrides?: CallOverrides): Promise<BigNumber>;
        rewardToken(overrides?: CallOverrides): Promise<string>;
        rewards(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        stake(_account: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        userRewardPerTokenPaid(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        withdraw(_account: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "Mock_ExtraRewardPaid(uint256,address,uint256)"(index?: BigNumberish | null, user?: string | null, reward?: null): Mock_ExtraRewardPaidEventFilter;
        Mock_ExtraRewardPaid(index?: BigNumberish | null, user?: string | null, reward?: null): Mock_ExtraRewardPaidEventFilter;
        "Mock_ExtraStaked(uint256,address,uint256)"(index?: BigNumberish | null, user?: string | null, amount?: null): Mock_ExtraStakedEventFilter;
        Mock_ExtraStaked(index?: BigNumberish | null, user?: string | null, amount?: null): Mock_ExtraStakedEventFilter;
        "Mock_ExtraWithdrawn(uint256,address,uint256)"(index?: BigNumberish | null, user?: string | null, amount?: null): Mock_ExtraWithdrawnEventFilter;
        Mock_ExtraWithdrawn(index?: BigNumberish | null, user?: string | null, amount?: null): Mock_ExtraWithdrawnEventFilter;
    };
    estimateGas: {
        addRewardAmount(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;
        currentRewards(overrides?: CallOverrides): Promise<BigNumber>;
        deposits(overrides?: CallOverrides): Promise<BigNumber>;
        donate(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        duration(overrides?: CallOverrides): Promise<BigNumber>;
        earned(account: string, overrides?: CallOverrides): Promise<BigNumber>;
        "getReward()"(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        "getReward(address)"(_account: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        historicalRewards(overrides?: CallOverrides): Promise<BigNumber>;
        lastUpdateTime(overrides?: CallOverrides): Promise<BigNumber>;
        newRewardRatio(overrides?: CallOverrides): Promise<BigNumber>;
        operator(overrides?: CallOverrides): Promise<BigNumber>;
        periodFinish(overrides?: CallOverrides): Promise<BigNumber>;
        queueNewRewards(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        queuedRewards(overrides?: CallOverrides): Promise<BigNumber>;
        rewardPerToken(overrides?: CallOverrides): Promise<BigNumber>;
        rewardPerTokenStored(overrides?: CallOverrides): Promise<BigNumber>;
        rewardRate(overrides?: CallOverrides): Promise<BigNumber>;
        rewardToken(overrides?: CallOverrides): Promise<BigNumber>;
        rewards(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        stake(_account: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        userRewardPerTokenPaid(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        withdraw(_account: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addRewardAmount(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        balanceOf(account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        currentRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        deposits(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        donate(arg0: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        duration(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        earned(account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "getReward()"(overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        "getReward(address)"(_account: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        historicalRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lastUpdateTime(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        newRewardRatio(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        operator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        periodFinish(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        queueNewRewards(arg0: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        queuedRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewardPerToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewardPerTokenStored(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewardRate(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewardToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewards(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stake(_account: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        userRewardPerTokenPaid(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        withdraw(_account: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
    };
}
