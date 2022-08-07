import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export declare type MultiCallStruct = {
    target: string;
    callData: BytesLike;
};
export declare type MultiCallStructOutput = [string, string] & {
    target: string;
    callData: string;
};
export interface ICreditFacadeInterface extends utils.Interface {
    functions: {
        "addCollateral(address,address,uint256)": FunctionFragment;
        "approve(address,address,uint256)": FunctionFragment;
        "approveAccountTransfer(address,bool)": FunctionFragment;
        "calcCreditAccountHealthFactor(address)": FunctionFragment;
        "calcTotalValue(address)": FunctionFragment;
        "closeCreditAccount(address,uint256,bool,(address,bytes)[])": FunctionFragment;
        "creditManager()": FunctionFragment;
        "decreaseDebt(uint256)": FunctionFragment;
        "degenNFT()": FunctionFragment;
        "enableToken(address)": FunctionFragment;
        "hasOpenedCreditAccount(address)": FunctionFragment;
        "increaseDebt(uint256)": FunctionFragment;
        "isTokenAllowed(address)": FunctionFragment;
        "limits()": FunctionFragment;
        "liquidateCreditAccount(address,address,uint256,bool,(address,bytes)[])": FunctionFragment;
        "liquidateExpiredCreditAccount(address,address,uint256,bool,(address,bytes)[])": FunctionFragment;
        "multicall((address,bytes)[])": FunctionFragment;
        "openCreditAccount(uint256,address,uint16,uint16)": FunctionFragment;
        "openCreditAccountMulticall(uint256,address,(address,bytes)[],uint16)": FunctionFragment;
        "params()": FunctionFragment;
        "transferAccountOwnership(address)": FunctionFragment;
        "transfersAllowed(address,address)": FunctionFragment;
        "version()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addCollateral" | "approve" | "approveAccountTransfer" | "calcCreditAccountHealthFactor" | "calcTotalValue" | "closeCreditAccount" | "creditManager" | "decreaseDebt" | "degenNFT" | "enableToken" | "hasOpenedCreditAccount" | "increaseDebt" | "isTokenAllowed" | "limits" | "liquidateCreditAccount" | "liquidateExpiredCreditAccount" | "multicall" | "openCreditAccount" | "openCreditAccountMulticall" | "params" | "transferAccountOwnership" | "transfersAllowed" | "version"): FunctionFragment;
    encodeFunctionData(functionFragment: "addCollateral", values: [string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "approve", values: [string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "approveAccountTransfer", values: [string, boolean]): string;
    encodeFunctionData(functionFragment: "calcCreditAccountHealthFactor", values: [string]): string;
    encodeFunctionData(functionFragment: "calcTotalValue", values: [string]): string;
    encodeFunctionData(functionFragment: "closeCreditAccount", values: [string, BigNumberish, boolean, MultiCallStruct[]]): string;
    encodeFunctionData(functionFragment: "creditManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "decreaseDebt", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "degenNFT", values?: undefined): string;
    encodeFunctionData(functionFragment: "enableToken", values: [string]): string;
    encodeFunctionData(functionFragment: "hasOpenedCreditAccount", values: [string]): string;
    encodeFunctionData(functionFragment: "increaseDebt", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "isTokenAllowed", values: [string]): string;
    encodeFunctionData(functionFragment: "limits", values?: undefined): string;
    encodeFunctionData(functionFragment: "liquidateCreditAccount", values: [string, string, BigNumberish, boolean, MultiCallStruct[]]): string;
    encodeFunctionData(functionFragment: "liquidateExpiredCreditAccount", values: [string, string, BigNumberish, boolean, MultiCallStruct[]]): string;
    encodeFunctionData(functionFragment: "multicall", values: [MultiCallStruct[]]): string;
    encodeFunctionData(functionFragment: "openCreditAccount", values: [BigNumberish, string, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "openCreditAccountMulticall", values: [BigNumberish, string, MultiCallStruct[], BigNumberish]): string;
    encodeFunctionData(functionFragment: "params", values?: undefined): string;
    encodeFunctionData(functionFragment: "transferAccountOwnership", values: [string]): string;
    encodeFunctionData(functionFragment: "transfersAllowed", values: [string, string]): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    decodeFunctionResult(functionFragment: "addCollateral", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approveAccountTransfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "calcCreditAccountHealthFactor", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "calcTotalValue", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "closeCreditAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "creditManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "decreaseDebt", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "degenNFT", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "enableToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "hasOpenedCreditAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "increaseDebt", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isTokenAllowed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "limits", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "liquidateCreditAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "liquidateExpiredCreditAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "multicall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "openCreditAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "openCreditAccountMulticall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "params", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferAccountOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transfersAllowed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    events: {
        "AddCollateral(address,address,uint256)": EventFragment;
        "CloseCreditAccount(address,address)": EventFragment;
        "DecreaseBorrowedAmount(address,uint256)": EventFragment;
        "IncreaseBorrowedAmount(address,uint256)": EventFragment;
        "LiquidateCreditAccount(address,address,address,uint256)": EventFragment;
        "LiquidateExpiredCreditAccount(address,address,address,uint256)": EventFragment;
        "MultiCallFinished()": EventFragment;
        "MultiCallStarted(address)": EventFragment;
        "OpenCreditAccount(address,address,uint256,uint16)": EventFragment;
        "TokenDisabled(address,address)": EventFragment;
        "TokenEnabled(address,address)": EventFragment;
        "TransferAccount(address,address)": EventFragment;
        "TransferAccountAllowed(address,address,bool)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AddCollateral"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "CloseCreditAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "DecreaseBorrowedAmount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IncreaseBorrowedAmount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "LiquidateCreditAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "LiquidateExpiredCreditAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MultiCallFinished"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MultiCallStarted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OpenCreditAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenDisabled"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenEnabled"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferAccount"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferAccountAllowed"): EventFragment;
}
export interface AddCollateralEventObject {
    onBehalfOf: string;
    token: string;
    value: BigNumber;
}
export declare type AddCollateralEvent = TypedEvent<[
    string,
    string,
    BigNumber
], AddCollateralEventObject>;
export declare type AddCollateralEventFilter = TypedEventFilter<AddCollateralEvent>;
export interface CloseCreditAccountEventObject {
    owner: string;
    to: string;
}
export declare type CloseCreditAccountEvent = TypedEvent<[
    string,
    string
], CloseCreditAccountEventObject>;
export declare type CloseCreditAccountEventFilter = TypedEventFilter<CloseCreditAccountEvent>;
export interface DecreaseBorrowedAmountEventObject {
    borrower: string;
    amount: BigNumber;
}
export declare type DecreaseBorrowedAmountEvent = TypedEvent<[
    string,
    BigNumber
], DecreaseBorrowedAmountEventObject>;
export declare type DecreaseBorrowedAmountEventFilter = TypedEventFilter<DecreaseBorrowedAmountEvent>;
export interface IncreaseBorrowedAmountEventObject {
    borrower: string;
    amount: BigNumber;
}
export declare type IncreaseBorrowedAmountEvent = TypedEvent<[
    string,
    BigNumber
], IncreaseBorrowedAmountEventObject>;
export declare type IncreaseBorrowedAmountEventFilter = TypedEventFilter<IncreaseBorrowedAmountEvent>;
export interface LiquidateCreditAccountEventObject {
    owner: string;
    liquidator: string;
    to: string;
    remainingFunds: BigNumber;
}
export declare type LiquidateCreditAccountEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber
], LiquidateCreditAccountEventObject>;
export declare type LiquidateCreditAccountEventFilter = TypedEventFilter<LiquidateCreditAccountEvent>;
export interface LiquidateExpiredCreditAccountEventObject {
    owner: string;
    liquidator: string;
    to: string;
    remainingFunds: BigNumber;
}
export declare type LiquidateExpiredCreditAccountEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber
], LiquidateExpiredCreditAccountEventObject>;
export declare type LiquidateExpiredCreditAccountEventFilter = TypedEventFilter<LiquidateExpiredCreditAccountEvent>;
export interface MultiCallFinishedEventObject {
}
export declare type MultiCallFinishedEvent = TypedEvent<[
], MultiCallFinishedEventObject>;
export declare type MultiCallFinishedEventFilter = TypedEventFilter<MultiCallFinishedEvent>;
export interface MultiCallStartedEventObject {
    borrower: string;
}
export declare type MultiCallStartedEvent = TypedEvent<[
    string
], MultiCallStartedEventObject>;
export declare type MultiCallStartedEventFilter = TypedEventFilter<MultiCallStartedEvent>;
export interface OpenCreditAccountEventObject {
    onBehalfOf: string;
    creditAccount: string;
    borrowAmount: BigNumber;
    referralCode: number;
}
export declare type OpenCreditAccountEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    number
], OpenCreditAccountEventObject>;
export declare type OpenCreditAccountEventFilter = TypedEventFilter<OpenCreditAccountEvent>;
export interface TokenDisabledEventObject {
    creditAccount: string;
    token: string;
}
export declare type TokenDisabledEvent = TypedEvent<[
    string,
    string
], TokenDisabledEventObject>;
export declare type TokenDisabledEventFilter = TypedEventFilter<TokenDisabledEvent>;
export interface TokenEnabledEventObject {
    creditAccount: string;
    token: string;
}
export declare type TokenEnabledEvent = TypedEvent<[
    string,
    string
], TokenEnabledEventObject>;
export declare type TokenEnabledEventFilter = TypedEventFilter<TokenEnabledEvent>;
export interface TransferAccountEventObject {
    oldOwner: string;
    newOwner: string;
}
export declare type TransferAccountEvent = TypedEvent<[
    string,
    string
], TransferAccountEventObject>;
export declare type TransferAccountEventFilter = TypedEventFilter<TransferAccountEvent>;
export interface TransferAccountAllowedEventObject {
    from: string;
    to: string;
    state: boolean;
}
export declare type TransferAccountAllowedEvent = TypedEvent<[
    string,
    string,
    boolean
], TransferAccountAllowedEventObject>;
export declare type TransferAccountAllowedEventFilter = TypedEventFilter<TransferAccountAllowedEvent>;
export interface ICreditFacade extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ICreditFacadeInterface;
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
        addCollateral(onBehalfOf: string, token: string, amount: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        approve(targetContract: string, token: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        approveAccountTransfer(from: string, state: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        calcCreditAccountHealthFactor(creditAccount: string, overrides?: CallOverrides): Promise<[BigNumber] & {
            hf: BigNumber;
        }>;
        calcTotalValue(creditAccount: string, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
            total: BigNumber;
            twv: BigNumber;
        }>;
        closeCreditAccount(to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        creditManager(overrides?: CallOverrides): Promise<[string]>;
        decreaseDebt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        degenNFT(overrides?: CallOverrides): Promise<[string]>;
        enableToken(token: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        hasOpenedCreditAccount(borrower: string, overrides?: CallOverrides): Promise<[boolean]>;
        increaseDebt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        isTokenAllowed(token: string, overrides?: CallOverrides): Promise<[boolean]>;
        limits(overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            minBorrowedAmount: BigNumber;
            maxBorrowedAmount: BigNumber;
        }>;
        liquidateCreditAccount(borrower: string, to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        liquidateExpiredCreditAccount(borrower: string, to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        multicall(calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        openCreditAccount(amount: BigNumberish, onBehalfOf: string, leverageFactor: BigNumberish, referralCode: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        openCreditAccountMulticall(borrowedAmount: BigNumberish, onBehalfOf: string, calls: MultiCallStruct[], referralCode: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        params(overrides?: CallOverrides): Promise<[
            BigNumber,
            boolean,
            number
        ] & {
            maxBorrowedAmountPerBlock: BigNumber;
            isIncreaseDebtForbidden: boolean;
            expirationDate: number;
        }>;
        transferAccountOwnership(to: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        transfersAllowed(from: string, to: string, overrides?: CallOverrides): Promise<[boolean]>;
        version(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    addCollateral(onBehalfOf: string, token: string, amount: BigNumberish, overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    approve(targetContract: string, token: string, amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    approveAccountTransfer(from: string, state: boolean, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    calcCreditAccountHealthFactor(creditAccount: string, overrides?: CallOverrides): Promise<BigNumber>;
    calcTotalValue(creditAccount: string, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
        total: BigNumber;
        twv: BigNumber;
    }>;
    closeCreditAccount(to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    creditManager(overrides?: CallOverrides): Promise<string>;
    decreaseDebt(amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    degenNFT(overrides?: CallOverrides): Promise<string>;
    enableToken(token: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    hasOpenedCreditAccount(borrower: string, overrides?: CallOverrides): Promise<boolean>;
    increaseDebt(amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    isTokenAllowed(token: string, overrides?: CallOverrides): Promise<boolean>;
    limits(overrides?: CallOverrides): Promise<[
        BigNumber,
        BigNumber
    ] & {
        minBorrowedAmount: BigNumber;
        maxBorrowedAmount: BigNumber;
    }>;
    liquidateCreditAccount(borrower: string, to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    liquidateExpiredCreditAccount(borrower: string, to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    multicall(calls: MultiCallStruct[], overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    openCreditAccount(amount: BigNumberish, onBehalfOf: string, leverageFactor: BigNumberish, referralCode: BigNumberish, overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    openCreditAccountMulticall(borrowedAmount: BigNumberish, onBehalfOf: string, calls: MultiCallStruct[], referralCode: BigNumberish, overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    params(overrides?: CallOverrides): Promise<[
        BigNumber,
        boolean,
        number
    ] & {
        maxBorrowedAmountPerBlock: BigNumber;
        isIncreaseDebtForbidden: boolean;
        expirationDate: number;
    }>;
    transferAccountOwnership(to: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    transfersAllowed(from: string, to: string, overrides?: CallOverrides): Promise<boolean>;
    version(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        addCollateral(onBehalfOf: string, token: string, amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        approve(targetContract: string, token: string, amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        approveAccountTransfer(from: string, state: boolean, overrides?: CallOverrides): Promise<void>;
        calcCreditAccountHealthFactor(creditAccount: string, overrides?: CallOverrides): Promise<BigNumber>;
        calcTotalValue(creditAccount: string, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
            total: BigNumber;
            twv: BigNumber;
        }>;
        closeCreditAccount(to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: CallOverrides): Promise<void>;
        creditManager(overrides?: CallOverrides): Promise<string>;
        decreaseDebt(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        degenNFT(overrides?: CallOverrides): Promise<string>;
        enableToken(token: string, overrides?: CallOverrides): Promise<void>;
        hasOpenedCreditAccount(borrower: string, overrides?: CallOverrides): Promise<boolean>;
        increaseDebt(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        isTokenAllowed(token: string, overrides?: CallOverrides): Promise<boolean>;
        limits(overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            minBorrowedAmount: BigNumber;
            maxBorrowedAmount: BigNumber;
        }>;
        liquidateCreditAccount(borrower: string, to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: CallOverrides): Promise<void>;
        liquidateExpiredCreditAccount(borrower: string, to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: CallOverrides): Promise<void>;
        multicall(calls: MultiCallStruct[], overrides?: CallOverrides): Promise<void>;
        openCreditAccount(amount: BigNumberish, onBehalfOf: string, leverageFactor: BigNumberish, referralCode: BigNumberish, overrides?: CallOverrides): Promise<void>;
        openCreditAccountMulticall(borrowedAmount: BigNumberish, onBehalfOf: string, calls: MultiCallStruct[], referralCode: BigNumberish, overrides?: CallOverrides): Promise<void>;
        params(overrides?: CallOverrides): Promise<[
            BigNumber,
            boolean,
            number
        ] & {
            maxBorrowedAmountPerBlock: BigNumber;
            isIncreaseDebtForbidden: boolean;
            expirationDate: number;
        }>;
        transferAccountOwnership(to: string, overrides?: CallOverrides): Promise<void>;
        transfersAllowed(from: string, to: string, overrides?: CallOverrides): Promise<boolean>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {
        "AddCollateral(address,address,uint256)"(onBehalfOf?: string | null, token?: string | null, value?: null): AddCollateralEventFilter;
        AddCollateral(onBehalfOf?: string | null, token?: string | null, value?: null): AddCollateralEventFilter;
        "CloseCreditAccount(address,address)"(owner?: string | null, to?: string | null): CloseCreditAccountEventFilter;
        CloseCreditAccount(owner?: string | null, to?: string | null): CloseCreditAccountEventFilter;
        "DecreaseBorrowedAmount(address,uint256)"(borrower?: string | null, amount?: null): DecreaseBorrowedAmountEventFilter;
        DecreaseBorrowedAmount(borrower?: string | null, amount?: null): DecreaseBorrowedAmountEventFilter;
        "IncreaseBorrowedAmount(address,uint256)"(borrower?: string | null, amount?: null): IncreaseBorrowedAmountEventFilter;
        IncreaseBorrowedAmount(borrower?: string | null, amount?: null): IncreaseBorrowedAmountEventFilter;
        "LiquidateCreditAccount(address,address,address,uint256)"(owner?: string | null, liquidator?: string | null, to?: string | null, remainingFunds?: null): LiquidateCreditAccountEventFilter;
        LiquidateCreditAccount(owner?: string | null, liquidator?: string | null, to?: string | null, remainingFunds?: null): LiquidateCreditAccountEventFilter;
        "LiquidateExpiredCreditAccount(address,address,address,uint256)"(owner?: string | null, liquidator?: string | null, to?: string | null, remainingFunds?: null): LiquidateExpiredCreditAccountEventFilter;
        LiquidateExpiredCreditAccount(owner?: string | null, liquidator?: string | null, to?: string | null, remainingFunds?: null): LiquidateExpiredCreditAccountEventFilter;
        "MultiCallFinished()"(): MultiCallFinishedEventFilter;
        MultiCallFinished(): MultiCallFinishedEventFilter;
        "MultiCallStarted(address)"(borrower?: string | null): MultiCallStartedEventFilter;
        MultiCallStarted(borrower?: string | null): MultiCallStartedEventFilter;
        "OpenCreditAccount(address,address,uint256,uint16)"(onBehalfOf?: string | null, creditAccount?: string | null, borrowAmount?: null, referralCode?: null): OpenCreditAccountEventFilter;
        OpenCreditAccount(onBehalfOf?: string | null, creditAccount?: string | null, borrowAmount?: null, referralCode?: null): OpenCreditAccountEventFilter;
        "TokenDisabled(address,address)"(creditAccount?: null, token?: null): TokenDisabledEventFilter;
        TokenDisabled(creditAccount?: null, token?: null): TokenDisabledEventFilter;
        "TokenEnabled(address,address)"(creditAccount?: null, token?: null): TokenEnabledEventFilter;
        TokenEnabled(creditAccount?: null, token?: null): TokenEnabledEventFilter;
        "TransferAccount(address,address)"(oldOwner?: string | null, newOwner?: string | null): TransferAccountEventFilter;
        TransferAccount(oldOwner?: string | null, newOwner?: string | null): TransferAccountEventFilter;
        "TransferAccountAllowed(address,address,bool)"(from?: string | null, to?: string | null, state?: null): TransferAccountAllowedEventFilter;
        TransferAccountAllowed(from?: string | null, to?: string | null, state?: null): TransferAccountAllowedEventFilter;
    };
    estimateGas: {
        addCollateral(onBehalfOf: string, token: string, amount: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        approve(targetContract: string, token: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        approveAccountTransfer(from: string, state: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        calcCreditAccountHealthFactor(creditAccount: string, overrides?: CallOverrides): Promise<BigNumber>;
        calcTotalValue(creditAccount: string, overrides?: CallOverrides): Promise<BigNumber>;
        closeCreditAccount(to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        creditManager(overrides?: CallOverrides): Promise<BigNumber>;
        decreaseDebt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        degenNFT(overrides?: CallOverrides): Promise<BigNumber>;
        enableToken(token: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        hasOpenedCreditAccount(borrower: string, overrides?: CallOverrides): Promise<BigNumber>;
        increaseDebt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        isTokenAllowed(token: string, overrides?: CallOverrides): Promise<BigNumber>;
        limits(overrides?: CallOverrides): Promise<BigNumber>;
        liquidateCreditAccount(borrower: string, to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        liquidateExpiredCreditAccount(borrower: string, to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        multicall(calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        openCreditAccount(amount: BigNumberish, onBehalfOf: string, leverageFactor: BigNumberish, referralCode: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        openCreditAccountMulticall(borrowedAmount: BigNumberish, onBehalfOf: string, calls: MultiCallStruct[], referralCode: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        params(overrides?: CallOverrides): Promise<BigNumber>;
        transferAccountOwnership(to: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        transfersAllowed(from: string, to: string, overrides?: CallOverrides): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        addCollateral(onBehalfOf: string, token: string, amount: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        approve(targetContract: string, token: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        approveAccountTransfer(from: string, state: boolean, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        calcCreditAccountHealthFactor(creditAccount: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        calcTotalValue(creditAccount: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        closeCreditAccount(to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        creditManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        decreaseDebt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        degenNFT(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        enableToken(token: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        hasOpenedCreditAccount(borrower: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        increaseDebt(amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        isTokenAllowed(token: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        limits(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        liquidateCreditAccount(borrower: string, to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        liquidateExpiredCreditAccount(borrower: string, to: string, skipTokenMask: BigNumberish, convertWETH: boolean, calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        multicall(calls: MultiCallStruct[], overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        openCreditAccount(amount: BigNumberish, onBehalfOf: string, leverageFactor: BigNumberish, referralCode: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        openCreditAccountMulticall(borrowedAmount: BigNumberish, onBehalfOf: string, calls: MultiCallStruct[], referralCode: BigNumberish, overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        params(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        transferAccountOwnership(to: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        transfersAllowed(from: string, to: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
