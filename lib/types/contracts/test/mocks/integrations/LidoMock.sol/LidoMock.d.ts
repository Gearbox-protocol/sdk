import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface LidoMockInterface extends utils.Interface {
    functions: {
        "allowance(address,address)": FunctionFragment;
        "approve(address,uint256)": FunctionFragment;
        "balanceOf(address)": FunctionFragment;
        "burnShares(address,uint256)": FunctionFragment;
        "decimals()": FunctionFragment;
        "decreaseAllowance(address,uint256)": FunctionFragment;
        "getPooledEthByShares(uint256)": FunctionFragment;
        "getSharesByPooledEth(uint256)": FunctionFragment;
        "getTotalPooledEther()": FunctionFragment;
        "getTotalShares()": FunctionFragment;
        "increaseAllowance(address,uint256)": FunctionFragment;
        "name()": FunctionFragment;
        "sharesOf(address)": FunctionFragment;
        "submit(address)": FunctionFragment;
        "symbol()": FunctionFragment;
        "syncExchangeRate(uint256,uint256)": FunctionFragment;
        "totalPooledEtherSynced()": FunctionFragment;
        "totalSharesSynced()": FunctionFragment;
        "totalSupply()": FunctionFragment;
        "transfer(address,uint256)": FunctionFragment;
        "transferFrom(address,address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "allowance" | "approve" | "balanceOf" | "burnShares" | "decimals" | "decreaseAllowance" | "getPooledEthByShares" | "getSharesByPooledEth" | "getTotalPooledEther" | "getTotalShares" | "increaseAllowance" | "name" | "sharesOf" | "submit" | "symbol" | "syncExchangeRate" | "totalPooledEtherSynced" | "totalSharesSynced" | "totalSupply" | "transfer" | "transferFrom"): FunctionFragment;
    encodeFunctionData(functionFragment: "allowance", values: [string, string]): string;
    encodeFunctionData(functionFragment: "approve", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
    encodeFunctionData(functionFragment: "burnShares", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
    encodeFunctionData(functionFragment: "decreaseAllowance", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getPooledEthByShares", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getSharesByPooledEth", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getTotalPooledEther", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTotalShares", values?: undefined): string;
    encodeFunctionData(functionFragment: "increaseAllowance", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "name", values?: undefined): string;
    encodeFunctionData(functionFragment: "sharesOf", values: [string]): string;
    encodeFunctionData(functionFragment: "submit", values: [string]): string;
    encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
    encodeFunctionData(functionFragment: "syncExchangeRate", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "totalPooledEtherSynced", values?: undefined): string;
    encodeFunctionData(functionFragment: "totalSharesSynced", values?: undefined): string;
    encodeFunctionData(functionFragment: "totalSupply", values?: undefined): string;
    encodeFunctionData(functionFragment: "transfer", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "transferFrom", values: [string, string, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "burnShares", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "decreaseAllowance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPooledEthByShares", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSharesByPooledEth", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalPooledEther", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalShares", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "increaseAllowance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "sharesOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "submit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "syncExchangeRate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalPooledEtherSynced", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalSharesSynced", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalSupply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferFrom", data: BytesLike): Result;
    events: {
        "Approval(address,address,uint256)": EventFragment;
        "Mock_Submitted(address,uint256,address)": EventFragment;
        "Transfer(address,address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Mock_Submitted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
}
export interface ApprovalEventObject {
    owner: string;
    spender: string;
    value: BigNumber;
}
export declare type ApprovalEvent = TypedEvent<[
    string,
    string,
    BigNumber
], ApprovalEventObject>;
export declare type ApprovalEventFilter = TypedEventFilter<ApprovalEvent>;
export interface Mock_SubmittedEventObject {
    sender: string;
    amount: BigNumber;
    referral: string;
}
export declare type Mock_SubmittedEvent = TypedEvent<[
    string,
    BigNumber,
    string
], Mock_SubmittedEventObject>;
export declare type Mock_SubmittedEventFilter = TypedEventFilter<Mock_SubmittedEvent>;
export interface TransferEventObject {
    from: string;
    to: string;
    value: BigNumber;
}
export declare type TransferEvent = TypedEvent<[
    string,
    string,
    BigNumber
], TransferEventObject>;
export declare type TransferEventFilter = TypedEventFilter<TransferEvent>;
export interface LidoMock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: LidoMockInterface;
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
        allowance(_owner: string, _spender: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        approve(_spender: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        balanceOf(_account: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        burnShares(_account: string, _sharesAmount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        decimals(overrides?: CallOverrides): Promise<[number]>;
        decreaseAllowance(_spender: string, _subtractedValue: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        getPooledEthByShares(_sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        getSharesByPooledEth(_ethAmount: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        getTotalPooledEther(overrides?: CallOverrides): Promise<[BigNumber]>;
        getTotalShares(overrides?: CallOverrides): Promise<[BigNumber]>;
        increaseAllowance(_spender: string, _addedValue: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        name(overrides?: CallOverrides): Promise<[string]>;
        sharesOf(_account: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        submit(_referral: string, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        symbol(overrides?: CallOverrides): Promise<[string]>;
        syncExchangeRate(totalPooledEther: BigNumberish, totalShares: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        totalPooledEtherSynced(overrides?: CallOverrides): Promise<[BigNumber]>;
        totalSharesSynced(overrides?: CallOverrides): Promise<[BigNumber]>;
        totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;
        transfer(_recipient: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        transferFrom(_sender: string, _recipient: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
    };
    allowance(_owner: string, _spender: string, overrides?: CallOverrides): Promise<BigNumber>;
    approve(_spender: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    balanceOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
    burnShares(_account: string, _sharesAmount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    decimals(overrides?: CallOverrides): Promise<number>;
    decreaseAllowance(_spender: string, _subtractedValue: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    getPooledEthByShares(_sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getSharesByPooledEth(_ethAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getTotalPooledEther(overrides?: CallOverrides): Promise<BigNumber>;
    getTotalShares(overrides?: CallOverrides): Promise<BigNumber>;
    increaseAllowance(_spender: string, _addedValue: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    name(overrides?: CallOverrides): Promise<string>;
    sharesOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
    submit(_referral: string, overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    symbol(overrides?: CallOverrides): Promise<string>;
    syncExchangeRate(totalPooledEther: BigNumberish, totalShares: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    totalPooledEtherSynced(overrides?: CallOverrides): Promise<BigNumber>;
    totalSharesSynced(overrides?: CallOverrides): Promise<BigNumber>;
    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
    transfer(_recipient: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    transferFrom(_sender: string, _recipient: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        allowance(_owner: string, _spender: string, overrides?: CallOverrides): Promise<BigNumber>;
        approve(_spender: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        balanceOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
        burnShares(_account: string, _sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        decimals(overrides?: CallOverrides): Promise<number>;
        decreaseAllowance(_spender: string, _subtractedValue: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        getPooledEthByShares(_sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getSharesByPooledEth(_ethAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalPooledEther(overrides?: CallOverrides): Promise<BigNumber>;
        getTotalShares(overrides?: CallOverrides): Promise<BigNumber>;
        increaseAllowance(_spender: string, _addedValue: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        name(overrides?: CallOverrides): Promise<string>;
        sharesOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
        submit(_referral: string, overrides?: CallOverrides): Promise<BigNumber>;
        symbol(overrides?: CallOverrides): Promise<string>;
        syncExchangeRate(totalPooledEther: BigNumberish, totalShares: BigNumberish, overrides?: CallOverrides): Promise<void>;
        totalPooledEtherSynced(overrides?: CallOverrides): Promise<BigNumber>;
        totalSharesSynced(overrides?: CallOverrides): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        transfer(_recipient: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        transferFrom(_sender: string, _recipient: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "Approval(address,address,uint256)"(owner?: string | null, spender?: string | null, value?: null): ApprovalEventFilter;
        Approval(owner?: string | null, spender?: string | null, value?: null): ApprovalEventFilter;
        "Mock_Submitted(address,uint256,address)"(sender?: string | null, amount?: null, referral?: null): Mock_SubmittedEventFilter;
        Mock_Submitted(sender?: string | null, amount?: null, referral?: null): Mock_SubmittedEventFilter;
        "Transfer(address,address,uint256)"(from?: string | null, to?: string | null, value?: null): TransferEventFilter;
        Transfer(from?: string | null, to?: string | null, value?: null): TransferEventFilter;
    };
    estimateGas: {
        allowance(_owner: string, _spender: string, overrides?: CallOverrides): Promise<BigNumber>;
        approve(_spender: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        balanceOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
        burnShares(_account: string, _sharesAmount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        decimals(overrides?: CallOverrides): Promise<BigNumber>;
        decreaseAllowance(_spender: string, _subtractedValue: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        getPooledEthByShares(_sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getSharesByPooledEth(_ethAmount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalPooledEther(overrides?: CallOverrides): Promise<BigNumber>;
        getTotalShares(overrides?: CallOverrides): Promise<BigNumber>;
        increaseAllowance(_spender: string, _addedValue: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        name(overrides?: CallOverrides): Promise<BigNumber>;
        sharesOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;
        submit(_referral: string, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        symbol(overrides?: CallOverrides): Promise<BigNumber>;
        syncExchangeRate(totalPooledEther: BigNumberish, totalShares: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        totalPooledEtherSynced(overrides?: CallOverrides): Promise<BigNumber>;
        totalSharesSynced(overrides?: CallOverrides): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        transfer(_recipient: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        transferFrom(_sender: string, _recipient: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        allowance(_owner: string, _spender: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        approve(_spender: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        balanceOf(_account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        burnShares(_account: string, _sharesAmount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        decreaseAllowance(_spender: string, _subtractedValue: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        getPooledEthByShares(_sharesAmount: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getSharesByPooledEth(_ethAmount: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalPooledEther(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalShares(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        increaseAllowance(_spender: string, _addedValue: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        name(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        sharesOf(_account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        submit(_referral: string, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        syncExchangeRate(totalPooledEther: BigNumberish, totalShares: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        totalPooledEtherSynced(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        totalSharesSynced(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        transfer(_recipient: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        transferFrom(_sender: string, _recipient: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
    };
}
