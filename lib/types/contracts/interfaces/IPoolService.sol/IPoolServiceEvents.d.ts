import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface IPoolServiceEventsInterface extends utils.Interface {
    functions: {};
    events: {
        "AddLiquidity(address,address,uint256,uint256)": EventFragment;
        "Borrow(address,address,uint256)": EventFragment;
        "BorrowForbidden(address)": EventFragment;
        "NewCreditManagerConnected(address)": EventFragment;
        "NewExpectedLiquidityLimit(uint256)": EventFragment;
        "NewInterestRateModel(address)": EventFragment;
        "NewWithdrawFee(uint256)": EventFragment;
        "RemoveLiquidity(address,address,uint256)": EventFragment;
        "Repay(address,uint256,uint256,uint256)": EventFragment;
        "UncoveredLoss(address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AddLiquidity"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Borrow"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "BorrowForbidden"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewCreditManagerConnected"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewExpectedLiquidityLimit"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewInterestRateModel"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewWithdrawFee"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RemoveLiquidity"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Repay"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "UncoveredLoss"): EventFragment;
}
export interface AddLiquidityEventObject {
    sender: string;
    onBehalfOf: string;
    amount: BigNumber;
    referralCode: BigNumber;
}
export declare type AddLiquidityEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    BigNumber
], AddLiquidityEventObject>;
export declare type AddLiquidityEventFilter = TypedEventFilter<AddLiquidityEvent>;
export interface BorrowEventObject {
    creditManager: string;
    creditAccount: string;
    amount: BigNumber;
}
export declare type BorrowEvent = TypedEvent<[
    string,
    string,
    BigNumber
], BorrowEventObject>;
export declare type BorrowEventFilter = TypedEventFilter<BorrowEvent>;
export interface BorrowForbiddenEventObject {
    creditManager: string;
}
export declare type BorrowForbiddenEvent = TypedEvent<[
    string
], BorrowForbiddenEventObject>;
export declare type BorrowForbiddenEventFilter = TypedEventFilter<BorrowForbiddenEvent>;
export interface NewCreditManagerConnectedEventObject {
    creditManager: string;
}
export declare type NewCreditManagerConnectedEvent = TypedEvent<[
    string
], NewCreditManagerConnectedEventObject>;
export declare type NewCreditManagerConnectedEventFilter = TypedEventFilter<NewCreditManagerConnectedEvent>;
export interface NewExpectedLiquidityLimitEventObject {
    newLimit: BigNumber;
}
export declare type NewExpectedLiquidityLimitEvent = TypedEvent<[
    BigNumber
], NewExpectedLiquidityLimitEventObject>;
export declare type NewExpectedLiquidityLimitEventFilter = TypedEventFilter<NewExpectedLiquidityLimitEvent>;
export interface NewInterestRateModelEventObject {
    newInterestRateModel: string;
}
export declare type NewInterestRateModelEvent = TypedEvent<[
    string
], NewInterestRateModelEventObject>;
export declare type NewInterestRateModelEventFilter = TypedEventFilter<NewInterestRateModelEvent>;
export interface NewWithdrawFeeEventObject {
    fee: BigNumber;
}
export declare type NewWithdrawFeeEvent = TypedEvent<[
    BigNumber
], NewWithdrawFeeEventObject>;
export declare type NewWithdrawFeeEventFilter = TypedEventFilter<NewWithdrawFeeEvent>;
export interface RemoveLiquidityEventObject {
    sender: string;
    to: string;
    amount: BigNumber;
}
export declare type RemoveLiquidityEvent = TypedEvent<[
    string,
    string,
    BigNumber
], RemoveLiquidityEventObject>;
export declare type RemoveLiquidityEventFilter = TypedEventFilter<RemoveLiquidityEvent>;
export interface RepayEventObject {
    creditManager: string;
    borrowedAmount: BigNumber;
    profit: BigNumber;
    loss: BigNumber;
}
export declare type RepayEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber,
    BigNumber
], RepayEventObject>;
export declare type RepayEventFilter = TypedEventFilter<RepayEvent>;
export interface UncoveredLossEventObject {
    creditManager: string;
    loss: BigNumber;
}
export declare type UncoveredLossEvent = TypedEvent<[
    string,
    BigNumber
], UncoveredLossEventObject>;
export declare type UncoveredLossEventFilter = TypedEventFilter<UncoveredLossEvent>;
export interface IPoolServiceEvents extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IPoolServiceEventsInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {};
    callStatic: {};
    filters: {
        "AddLiquidity(address,address,uint256,uint256)"(sender?: string | null, onBehalfOf?: string | null, amount?: null, referralCode?: null): AddLiquidityEventFilter;
        AddLiquidity(sender?: string | null, onBehalfOf?: string | null, amount?: null, referralCode?: null): AddLiquidityEventFilter;
        "Borrow(address,address,uint256)"(creditManager?: string | null, creditAccount?: string | null, amount?: null): BorrowEventFilter;
        Borrow(creditManager?: string | null, creditAccount?: string | null, amount?: null): BorrowEventFilter;
        "BorrowForbidden(address)"(creditManager?: string | null): BorrowForbiddenEventFilter;
        BorrowForbidden(creditManager?: string | null): BorrowForbiddenEventFilter;
        "NewCreditManagerConnected(address)"(creditManager?: string | null): NewCreditManagerConnectedEventFilter;
        NewCreditManagerConnected(creditManager?: string | null): NewCreditManagerConnectedEventFilter;
        "NewExpectedLiquidityLimit(uint256)"(newLimit?: null): NewExpectedLiquidityLimitEventFilter;
        NewExpectedLiquidityLimit(newLimit?: null): NewExpectedLiquidityLimitEventFilter;
        "NewInterestRateModel(address)"(newInterestRateModel?: string | null): NewInterestRateModelEventFilter;
        NewInterestRateModel(newInterestRateModel?: string | null): NewInterestRateModelEventFilter;
        "NewWithdrawFee(uint256)"(fee?: null): NewWithdrawFeeEventFilter;
        NewWithdrawFee(fee?: null): NewWithdrawFeeEventFilter;
        "RemoveLiquidity(address,address,uint256)"(sender?: string | null, to?: string | null, amount?: null): RemoveLiquidityEventFilter;
        RemoveLiquidity(sender?: string | null, to?: string | null, amount?: null): RemoveLiquidityEventFilter;
        "Repay(address,uint256,uint256,uint256)"(creditManager?: string | null, borrowedAmount?: null, profit?: null, loss?: null): RepayEventFilter;
        Repay(creditManager?: string | null, borrowedAmount?: null, profit?: null, loss?: null): RepayEventFilter;
        "UncoveredLoss(address,uint256)"(creditManager?: string | null, loss?: null): UncoveredLossEventFilter;
        UncoveredLoss(creditManager?: string | null, loss?: null): UncoveredLossEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
