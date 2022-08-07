import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface NewBoosterMockInterface extends utils.Interface {
    functions: {
        "FEE_DENOMINATOR()": FunctionFragment;
        "MaxFees()": FunctionFragment;
        "addPool(address)": FunctionFragment;
        "crv()": FunctionFragment;
        "deposit(uint256,uint256,bool)": FunctionFragment;
        "depositAll(uint256,bool)": FunctionFragment;
        "distributionAddressId()": FunctionFragment;
        "earmarkIncentive()": FunctionFragment;
        "feeDistro()": FunctionFragment;
        "feeManager()": FunctionFragment;
        "feeToken()": FunctionFragment;
        "gaugeMap(address)": FunctionFragment;
        "index()": FunctionFragment;
        "isShutdown()": FunctionFragment;
        "lockFees()": FunctionFragment;
        "lockIncentive()": FunctionFragment;
        "lockRewards()": FunctionFragment;
        "minter()": FunctionFragment;
        "owner()": FunctionFragment;
        "platformFee()": FunctionFragment;
        "poolInfo(uint256)": FunctionFragment;
        "poolLength()": FunctionFragment;
        "poolManager()": FunctionFragment;
        "registry()": FunctionFragment;
        "rewardArbitrator()": FunctionFragment;
        "rewardClaimed(uint256,address,uint256)": FunctionFragment;
        "rewardFactory()": FunctionFragment;
        "staker()": FunctionFragment;
        "stakerIncentive()": FunctionFragment;
        "stakerRewards()": FunctionFragment;
        "stashFactory()": FunctionFragment;
        "tokenFactory()": FunctionFragment;
        "treasury()": FunctionFragment;
        "voteDelegate()": FunctionFragment;
        "voteOwnership()": FunctionFragment;
        "voteParameter()": FunctionFragment;
        "withdraw(uint256,uint256)": FunctionFragment;
        "withdrawAll(uint256)": FunctionFragment;
        "withdrawTo(uint256,uint256,address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "FEE_DENOMINATOR" | "MaxFees" | "addPool" | "crv" | "deposit" | "depositAll" | "distributionAddressId" | "earmarkIncentive" | "feeDistro" | "feeManager" | "feeToken" | "gaugeMap" | "index" | "isShutdown" | "lockFees" | "lockIncentive" | "lockRewards" | "minter" | "owner" | "platformFee" | "poolInfo" | "poolLength" | "poolManager" | "registry" | "rewardArbitrator" | "rewardClaimed" | "rewardFactory" | "staker" | "stakerIncentive" | "stakerRewards" | "stashFactory" | "tokenFactory" | "treasury" | "voteDelegate" | "voteOwnership" | "voteParameter" | "withdraw" | "withdrawAll" | "withdrawTo"): FunctionFragment;
    encodeFunctionData(functionFragment: "FEE_DENOMINATOR", values?: undefined): string;
    encodeFunctionData(functionFragment: "MaxFees", values?: undefined): string;
    encodeFunctionData(functionFragment: "addPool", values: [string]): string;
    encodeFunctionData(functionFragment: "crv", values?: undefined): string;
    encodeFunctionData(functionFragment: "deposit", values: [BigNumberish, BigNumberish, boolean]): string;
    encodeFunctionData(functionFragment: "depositAll", values: [BigNumberish, boolean]): string;
    encodeFunctionData(functionFragment: "distributionAddressId", values?: undefined): string;
    encodeFunctionData(functionFragment: "earmarkIncentive", values?: undefined): string;
    encodeFunctionData(functionFragment: "feeDistro", values?: undefined): string;
    encodeFunctionData(functionFragment: "feeManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "feeToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "gaugeMap", values: [string]): string;
    encodeFunctionData(functionFragment: "index", values?: undefined): string;
    encodeFunctionData(functionFragment: "isShutdown", values?: undefined): string;
    encodeFunctionData(functionFragment: "lockFees", values?: undefined): string;
    encodeFunctionData(functionFragment: "lockIncentive", values?: undefined): string;
    encodeFunctionData(functionFragment: "lockRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "minter", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "platformFee", values?: undefined): string;
    encodeFunctionData(functionFragment: "poolInfo", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "poolLength", values?: undefined): string;
    encodeFunctionData(functionFragment: "poolManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "registry", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardArbitrator", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardClaimed", values: [BigNumberish, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "rewardFactory", values?: undefined): string;
    encodeFunctionData(functionFragment: "staker", values?: undefined): string;
    encodeFunctionData(functionFragment: "stakerIncentive", values?: undefined): string;
    encodeFunctionData(functionFragment: "stakerRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "stashFactory", values?: undefined): string;
    encodeFunctionData(functionFragment: "tokenFactory", values?: undefined): string;
    encodeFunctionData(functionFragment: "treasury", values?: undefined): string;
    encodeFunctionData(functionFragment: "voteDelegate", values?: undefined): string;
    encodeFunctionData(functionFragment: "voteOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "voteParameter", values?: undefined): string;
    encodeFunctionData(functionFragment: "withdraw", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "withdrawAll", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "withdrawTo", values: [BigNumberish, BigNumberish, string]): string;
    decodeFunctionResult(functionFragment: "FEE_DENOMINATOR", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "MaxFees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addPool", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "crv", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "distributionAddressId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "earmarkIncentive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "feeDistro", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "feeManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "feeToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "gaugeMap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "index", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isShutdown", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lockFees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lockIncentive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lockRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "minter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "platformFee", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "poolInfo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "poolLength", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "poolManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "registry", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardArbitrator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardClaimed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "staker", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stakerIncentive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stakerRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stashFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "treasury", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "voteDelegate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "voteOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "voteParameter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawTo", data: BytesLike): Result;
    events: {
        "Mock_Deposited(uint256,address,uint256,uint256,bool)": EventFragment;
        "Mock_Withdrawn(uint256,address,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Mock_Deposited"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Mock_Withdrawn"): EventFragment;
}
export interface Mock_DepositedEventObject {
    index: BigNumber;
    user: string;
    poolid: BigNumber;
    amount: BigNumber;
    _stake: boolean;
}
export declare type Mock_DepositedEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    boolean
], Mock_DepositedEventObject>;
export declare type Mock_DepositedEventFilter = TypedEventFilter<Mock_DepositedEvent>;
export interface Mock_WithdrawnEventObject {
    index: BigNumber;
    user: string;
    poolid: BigNumber;
    amount: BigNumber;
}
export declare type Mock_WithdrawnEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber,
    BigNumber
], Mock_WithdrawnEventObject>;
export declare type Mock_WithdrawnEventFilter = TypedEventFilter<Mock_WithdrawnEvent>;
export interface NewBoosterMock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: NewBoosterMockInterface;
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
        FEE_DENOMINATOR(overrides?: CallOverrides): Promise<[BigNumber]>;
        MaxFees(overrides?: CallOverrides): Promise<[BigNumber]>;
        addPool(_lptoken: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        crv(overrides?: CallOverrides): Promise<[string]>;
        deposit(_pid: BigNumberish, _amount: BigNumberish, _stake: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        depositAll(_pid: BigNumberish, _stake: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        distributionAddressId(overrides?: CallOverrides): Promise<[BigNumber]>;
        earmarkIncentive(overrides?: CallOverrides): Promise<[BigNumber]>;
        feeDistro(overrides?: CallOverrides): Promise<[string]>;
        feeManager(overrides?: CallOverrides): Promise<[string]>;
        feeToken(overrides?: CallOverrides): Promise<[string]>;
        gaugeMap(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;
        index(overrides?: CallOverrides): Promise<[BigNumber]>;
        isShutdown(overrides?: CallOverrides): Promise<[boolean]>;
        lockFees(overrides?: CallOverrides): Promise<[string]>;
        lockIncentive(overrides?: CallOverrides): Promise<[BigNumber]>;
        lockRewards(overrides?: CallOverrides): Promise<[string]>;
        minter(overrides?: CallOverrides): Promise<[string]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        platformFee(overrides?: CallOverrides): Promise<[BigNumber]>;
        poolInfo(arg0: BigNumberish, overrides?: CallOverrides): Promise<[
            string,
            string,
            string,
            string,
            string,
            boolean
        ] & {
            lptoken: string;
            token: string;
            gauge: string;
            crvRewards: string;
            stash: string;
            shutdown: boolean;
        }>;
        poolLength(overrides?: CallOverrides): Promise<[BigNumber]>;
        poolManager(overrides?: CallOverrides): Promise<[string]>;
        registry(overrides?: CallOverrides): Promise<[string]>;
        rewardArbitrator(overrides?: CallOverrides): Promise<[string]>;
        rewardClaimed(_pid: BigNumberish, _address: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        rewardFactory(overrides?: CallOverrides): Promise<[string]>;
        staker(overrides?: CallOverrides): Promise<[string]>;
        stakerIncentive(overrides?: CallOverrides): Promise<[BigNumber]>;
        stakerRewards(overrides?: CallOverrides): Promise<[string]>;
        stashFactory(overrides?: CallOverrides): Promise<[string]>;
        tokenFactory(overrides?: CallOverrides): Promise<[string]>;
        treasury(overrides?: CallOverrides): Promise<[string]>;
        voteDelegate(overrides?: CallOverrides): Promise<[string]>;
        voteOwnership(overrides?: CallOverrides): Promise<[string]>;
        voteParameter(overrides?: CallOverrides): Promise<[string]>;
        withdraw(_pid: BigNumberish, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        withdrawAll(_pid: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        withdrawTo(_pid: BigNumberish, _amount: BigNumberish, _to: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
    };
    FEE_DENOMINATOR(overrides?: CallOverrides): Promise<BigNumber>;
    MaxFees(overrides?: CallOverrides): Promise<BigNumber>;
    addPool(_lptoken: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    crv(overrides?: CallOverrides): Promise<string>;
    deposit(_pid: BigNumberish, _amount: BigNumberish, _stake: boolean, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    depositAll(_pid: BigNumberish, _stake: boolean, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    distributionAddressId(overrides?: CallOverrides): Promise<BigNumber>;
    earmarkIncentive(overrides?: CallOverrides): Promise<BigNumber>;
    feeDistro(overrides?: CallOverrides): Promise<string>;
    feeManager(overrides?: CallOverrides): Promise<string>;
    feeToken(overrides?: CallOverrides): Promise<string>;
    gaugeMap(arg0: string, overrides?: CallOverrides): Promise<boolean>;
    index(overrides?: CallOverrides): Promise<BigNumber>;
    isShutdown(overrides?: CallOverrides): Promise<boolean>;
    lockFees(overrides?: CallOverrides): Promise<string>;
    lockIncentive(overrides?: CallOverrides): Promise<BigNumber>;
    lockRewards(overrides?: CallOverrides): Promise<string>;
    minter(overrides?: CallOverrides): Promise<string>;
    owner(overrides?: CallOverrides): Promise<string>;
    platformFee(overrides?: CallOverrides): Promise<BigNumber>;
    poolInfo(arg0: BigNumberish, overrides?: CallOverrides): Promise<[
        string,
        string,
        string,
        string,
        string,
        boolean
    ] & {
        lptoken: string;
        token: string;
        gauge: string;
        crvRewards: string;
        stash: string;
        shutdown: boolean;
    }>;
    poolLength(overrides?: CallOverrides): Promise<BigNumber>;
    poolManager(overrides?: CallOverrides): Promise<string>;
    registry(overrides?: CallOverrides): Promise<string>;
    rewardArbitrator(overrides?: CallOverrides): Promise<string>;
    rewardClaimed(_pid: BigNumberish, _address: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    rewardFactory(overrides?: CallOverrides): Promise<string>;
    staker(overrides?: CallOverrides): Promise<string>;
    stakerIncentive(overrides?: CallOverrides): Promise<BigNumber>;
    stakerRewards(overrides?: CallOverrides): Promise<string>;
    stashFactory(overrides?: CallOverrides): Promise<string>;
    tokenFactory(overrides?: CallOverrides): Promise<string>;
    treasury(overrides?: CallOverrides): Promise<string>;
    voteDelegate(overrides?: CallOverrides): Promise<string>;
    voteOwnership(overrides?: CallOverrides): Promise<string>;
    voteParameter(overrides?: CallOverrides): Promise<string>;
    withdraw(_pid: BigNumberish, _amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    withdrawAll(_pid: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    withdrawTo(_pid: BigNumberish, _amount: BigNumberish, _to: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        FEE_DENOMINATOR(overrides?: CallOverrides): Promise<BigNumber>;
        MaxFees(overrides?: CallOverrides): Promise<BigNumber>;
        addPool(_lptoken: string, overrides?: CallOverrides): Promise<boolean>;
        crv(overrides?: CallOverrides): Promise<string>;
        deposit(_pid: BigNumberish, _amount: BigNumberish, _stake: boolean, overrides?: CallOverrides): Promise<boolean>;
        depositAll(_pid: BigNumberish, _stake: boolean, overrides?: CallOverrides): Promise<boolean>;
        distributionAddressId(overrides?: CallOverrides): Promise<BigNumber>;
        earmarkIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        feeDistro(overrides?: CallOverrides): Promise<string>;
        feeManager(overrides?: CallOverrides): Promise<string>;
        feeToken(overrides?: CallOverrides): Promise<string>;
        gaugeMap(arg0: string, overrides?: CallOverrides): Promise<boolean>;
        index(overrides?: CallOverrides): Promise<BigNumber>;
        isShutdown(overrides?: CallOverrides): Promise<boolean>;
        lockFees(overrides?: CallOverrides): Promise<string>;
        lockIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        lockRewards(overrides?: CallOverrides): Promise<string>;
        minter(overrides?: CallOverrides): Promise<string>;
        owner(overrides?: CallOverrides): Promise<string>;
        platformFee(overrides?: CallOverrides): Promise<BigNumber>;
        poolInfo(arg0: BigNumberish, overrides?: CallOverrides): Promise<[
            string,
            string,
            string,
            string,
            string,
            boolean
        ] & {
            lptoken: string;
            token: string;
            gauge: string;
            crvRewards: string;
            stash: string;
            shutdown: boolean;
        }>;
        poolLength(overrides?: CallOverrides): Promise<BigNumber>;
        poolManager(overrides?: CallOverrides): Promise<string>;
        registry(overrides?: CallOverrides): Promise<string>;
        rewardArbitrator(overrides?: CallOverrides): Promise<string>;
        rewardClaimed(_pid: BigNumberish, _address: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        rewardFactory(overrides?: CallOverrides): Promise<string>;
        staker(overrides?: CallOverrides): Promise<string>;
        stakerIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        stakerRewards(overrides?: CallOverrides): Promise<string>;
        stashFactory(overrides?: CallOverrides): Promise<string>;
        tokenFactory(overrides?: CallOverrides): Promise<string>;
        treasury(overrides?: CallOverrides): Promise<string>;
        voteDelegate(overrides?: CallOverrides): Promise<string>;
        voteOwnership(overrides?: CallOverrides): Promise<string>;
        voteParameter(overrides?: CallOverrides): Promise<string>;
        withdraw(_pid: BigNumberish, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        withdrawAll(_pid: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        withdrawTo(_pid: BigNumberish, _amount: BigNumberish, _to: string, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "Mock_Deposited(uint256,address,uint256,uint256,bool)"(index?: null, user?: string | null, poolid?: BigNumberish | null, amount?: null, _stake?: null): Mock_DepositedEventFilter;
        Mock_Deposited(index?: null, user?: string | null, poolid?: BigNumberish | null, amount?: null, _stake?: null): Mock_DepositedEventFilter;
        "Mock_Withdrawn(uint256,address,uint256,uint256)"(index?: null, user?: string | null, poolid?: BigNumberish | null, amount?: null): Mock_WithdrawnEventFilter;
        Mock_Withdrawn(index?: null, user?: string | null, poolid?: BigNumberish | null, amount?: null): Mock_WithdrawnEventFilter;
    };
    estimateGas: {
        FEE_DENOMINATOR(overrides?: CallOverrides): Promise<BigNumber>;
        MaxFees(overrides?: CallOverrides): Promise<BigNumber>;
        addPool(_lptoken: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        crv(overrides?: CallOverrides): Promise<BigNumber>;
        deposit(_pid: BigNumberish, _amount: BigNumberish, _stake: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        depositAll(_pid: BigNumberish, _stake: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        distributionAddressId(overrides?: CallOverrides): Promise<BigNumber>;
        earmarkIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        feeDistro(overrides?: CallOverrides): Promise<BigNumber>;
        feeManager(overrides?: CallOverrides): Promise<BigNumber>;
        feeToken(overrides?: CallOverrides): Promise<BigNumber>;
        gaugeMap(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        index(overrides?: CallOverrides): Promise<BigNumber>;
        isShutdown(overrides?: CallOverrides): Promise<BigNumber>;
        lockFees(overrides?: CallOverrides): Promise<BigNumber>;
        lockIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        lockRewards(overrides?: CallOverrides): Promise<BigNumber>;
        minter(overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        platformFee(overrides?: CallOverrides): Promise<BigNumber>;
        poolInfo(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        poolLength(overrides?: CallOverrides): Promise<BigNumber>;
        poolManager(overrides?: CallOverrides): Promise<BigNumber>;
        registry(overrides?: CallOverrides): Promise<BigNumber>;
        rewardArbitrator(overrides?: CallOverrides): Promise<BigNumber>;
        rewardClaimed(_pid: BigNumberish, _address: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        rewardFactory(overrides?: CallOverrides): Promise<BigNumber>;
        staker(overrides?: CallOverrides): Promise<BigNumber>;
        stakerIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        stakerRewards(overrides?: CallOverrides): Promise<BigNumber>;
        stashFactory(overrides?: CallOverrides): Promise<BigNumber>;
        tokenFactory(overrides?: CallOverrides): Promise<BigNumber>;
        treasury(overrides?: CallOverrides): Promise<BigNumber>;
        voteDelegate(overrides?: CallOverrides): Promise<BigNumber>;
        voteOwnership(overrides?: CallOverrides): Promise<BigNumber>;
        voteParameter(overrides?: CallOverrides): Promise<BigNumber>;
        withdraw(_pid: BigNumberish, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        withdrawAll(_pid: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        withdrawTo(_pid: BigNumberish, _amount: BigNumberish, _to: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        FEE_DENOMINATOR(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        MaxFees(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        addPool(_lptoken: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        crv(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        deposit(_pid: BigNumberish, _amount: BigNumberish, _stake: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        depositAll(_pid: BigNumberish, _stake: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        distributionAddressId(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        earmarkIncentive(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        feeDistro(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        feeManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        feeToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        gaugeMap(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        index(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isShutdown(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lockFees(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lockIncentive(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lockRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        minter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        platformFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        poolInfo(arg0: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        poolLength(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        poolManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        registry(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewardArbitrator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewardClaimed(_pid: BigNumberish, _address: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        rewardFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        staker(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stakerIncentive(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stakerRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stashFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokenFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        treasury(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        voteDelegate(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        voteOwnership(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        voteParameter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        withdraw(_pid: BigNumberish, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        withdrawAll(_pid: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        withdrawTo(_pid: BigNumberish, _amount: BigNumberish, _to: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
    };
}
