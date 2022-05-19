import { TokenData } from "./tokenData";
import { BigNumber } from "ethers";
import { EVMEvent, EVMTx, EVMEventProps } from "./eventOrTx";
export interface EventSerialized {
    type: "EventAddLiquidity" | "EventRemoveLiquidity" | "EventOpenCreditAccount" | "EventCloseCreditAccount" | "EventLiquidateCreditAccount" | "EventRepayCreditAccount" | "EventAddCollateral" | "EventIncreaseBorrowAmount" | "EventCMNewParameters" | "EventTokenAllowed" | "EventTokenForbidden" | "EventContractAllowed" | "EventContractForbidden" | "EventNewFastCheckParameters" | "EventPriceOracleUpdated" | "EventTransferPluginAllowed" | "EventNewInterestRateModel" | "EventNewCreditManagerConnected" | "EventBorrowForbidden" | "EventNewExpectedLiquidityLimit" | "EventNewWithdrawFee" | "EventNewPriceFeed" | "EventTakeForever" | "EventPaused" | "EventUnPaused" | "EventPausableAdminAdded" | "EventPausableAdminRemoved" | "EventUnpausableAdminAdded" | "EventUnpausableAdminRemoved" | "EventOwnershipTransferred";
    content: any;
}
export declare class EventParser {
    static serialize(items: Array<EVMTx>): string;
    static deserialize(data: EventSerialized): EVMEvent;
    static deserializeArray(data: Array<EventSerialized>): Array<EVMEvent>;
}
interface EventAddLiquidityProps extends EVMEventProps {
    amount: string;
    underlyingToken: string;
    pool: string;
}
export declare class EventAddLiquidity extends EVMEvent {
    readonly amount: BigNumber;
    readonly underlyingToken: string;
    readonly pool: string;
    constructor(opts: EventAddLiquidityProps);
    toString(tokenData: Record<string, TokenData>): string;
}
interface RemoveLiquidityProps extends EVMEventProps {
    amount: string;
    underlyingToken: string;
    dieselToken: string;
    pool: string;
}
export declare class EventRemoveLiquidity extends EVMEvent {
    readonly amount: BigNumber;
    readonly underlyingToken: string;
    readonly dieselToken: string;
    readonly pool: string;
    constructor(opts: RemoveLiquidityProps);
    toString(tokenData: Record<string, TokenData>): string;
}
interface OpenCreditAccountProps extends EVMEventProps {
    amount: string;
    underlyingToken: string;
    leverage: number;
    creditManager: string;
}
export declare class EventOpenCreditAccount extends EVMEvent {
    readonly amount: BigNumber;
    readonly underlyingToken: string;
    readonly leverage: number;
    readonly creditManager: string;
    constructor(opts: OpenCreditAccountProps);
    toString(tokenData: Record<string, TokenData>): string;
}
interface CloseCreditAccountProps extends EVMEventProps {
    amount: string;
    underlyingToken: string;
    creditManager: string;
}
export declare class EventCloseCreditAccount extends EVMEvent {
    readonly amount: BigNumber;
    readonly underlyingToken: string;
    readonly creditManager: string;
    constructor(opts: CloseCreditAccountProps);
    toString(tokenData: Record<string, TokenData>): string;
}
interface LiquidateCreditAccountProps extends EVMEventProps {
    amount: string;
    underlyingToken: string;
    creditManager: string;
}
export declare class EventLiquidateCreditAccount extends EVMEvent {
    readonly amount: BigNumber;
    readonly underlyingToken: string;
    readonly creditManager: string;
    constructor(opts: LiquidateCreditAccountProps);
    toString(tokenData: Record<string, TokenData>): string;
}
interface RepayCreditAccountProps extends EVMEventProps {
    underlyingToken: string;
    creditManager: string;
}
export declare class EventRepayCreditAccount extends EVMEvent {
    readonly underlyingToken: string;
    readonly creditManager: string;
    constructor(opts: RepayCreditAccountProps);
    toString(_: Record<string, TokenData>): string;
}
interface AddCollateralProps extends EVMEventProps {
    amount: string;
    addedToken: string;
    creditManager: string;
}
export declare class EventAddCollateral extends EVMEvent {
    readonly amount: BigNumber;
    readonly addedToken: string;
    readonly creditManager: string;
    constructor(opts: AddCollateralProps);
    toString(tokenData: Record<string, TokenData>): string;
}
interface IncreaseBorrowAmountProps extends EVMEventProps {
    amount: string;
    underlyingToken: string;
    creditManager: string;
}
export declare class EventIncreaseBorrowAmount extends EVMEvent {
    readonly amount: BigNumber;
    readonly underlyingToken: string;
    readonly creditManager: string;
    constructor(opts: IncreaseBorrowAmountProps);
    toString(tokenData: Record<string, TokenData>): string;
}
interface CMNewParametersProps extends EVMEventProps {
    creditManager: string;
    underlyingToken: string;
    minAmount: string;
    maxAmount: string;
    maxLeverage: number;
    feeInterest: number;
    feeLiquidation: number;
    liquidationDiscount: number;
    prevMinAmount: string;
    prevMaxAmount: string;
    prevMaxLeverage: number;
    prevFeeInterest: number;
    prevFeeLiquidation: number;
    prevLiquidationDiscount: number;
}
export declare class EventCMNewParameters extends EVMEvent {
    readonly creditManager: string;
    readonly underlyingToken: string;
    readonly minAmount: BigNumber;
    readonly maxAmount: BigNumber;
    readonly maxLeverage: number;
    readonly feeInterest: number;
    readonly feeLiquidation: number;
    readonly liquidationDiscount: number;
    readonly prevMinAmount: BigNumber;
    readonly prevMaxAmount: BigNumber;
    readonly prevMaxLeverage: number;
    readonly prevFeeInterest: number;
    readonly prevFeeLiquidation: number;
    readonly prevLiquidationDiscount: number;
    constructor(opts: CMNewParametersProps);
    toString(tokenData: Record<string, TokenData>): string;
}
export declare type TokenAllowanceType = "NewToken" | "LTUpdated" | "Allowed";
interface TokenAllowedProps extends EVMEventProps {
    creditManager: string;
    token: string;
    liquidityThreshold: number;
    prevLiquidationThreshold?: number;
    status: TokenAllowanceType;
}
export declare class EventTokenAllowed extends EVMEvent {
    readonly creditManager: string;
    readonly token: string;
    readonly liquidityThreshold: number;
    readonly prevLiquidationThreshold?: number;
    readonly status: TokenAllowanceType;
    constructor(opts: TokenAllowedProps);
    toString(tokenData: Record<string, TokenData>): string;
}
interface TokenForbiddenProps extends EVMEventProps {
    creditManager: string;
    token: string;
}
export declare class EventTokenForbidden extends EVMEvent {
    readonly creditManager: string;
    readonly token: string;
    constructor(opts: TokenForbiddenProps);
    toString(tokenData: Record<string, TokenData>): string;
}
export declare type EventContractAllowedStatus = "Connected" | "AdapterUpdate";
interface ContractAllowedProps extends EVMEventProps {
    creditManager: string;
    protocol: string;
    adapter: string;
    status: EventContractAllowedStatus;
}
export declare class EventContractAllowed extends EVMEvent {
    readonly creditManager: string;
    readonly protocol: string;
    readonly adapter: string;
    readonly status: EventContractAllowedStatus;
    constructor(opts: ContractAllowedProps);
    toString(_: Record<string, TokenData>): string;
}
interface ContractForbiddenProps extends EVMEventProps {
    creditManager: string;
    protocol: string;
}
export declare class EventContractForbidden extends EVMEvent {
    readonly creditManager: string;
    readonly protocol: string;
    constructor(opts: ContractForbiddenProps);
    toString(_: Record<string, TokenData>): string;
}
interface NewFastCheckParametersProps extends EVMEventProps {
    creditManager: string;
    chiThreshold: number;
    fastCheckDelay: number;
    prevChiThreshold?: number;
    prevFastCheckDelay?: number;
}
export declare class EventNewFastCheckParameters extends EVMEvent {
    readonly creditManager: string;
    readonly chiThreshold: number;
    readonly fastCheckDelay: number;
    readonly prevChiThreshold?: number;
    readonly prevFastCheckDelay?: number;
    constructor(opts: NewFastCheckParametersProps);
    toString(_: Record<string, TokenData>): string;
}
interface PriceOracleUpdatedProps extends EVMEventProps {
    creditManager: string;
    priceOracle: string;
}
export declare class EventPriceOracleUpdated extends EVMEvent {
    readonly creditManager: string;
    readonly priceOracle: string;
    constructor(opts: PriceOracleUpdatedProps);
    toString(_: Record<string, TokenData>): string;
}
interface TransferPluginAllowedProps extends EVMEventProps {
    creditManager: string;
    priceOracle: string;
    state: boolean;
}
export declare class EventTransferPluginAllowed extends EVMEvent {
    readonly creditManager: string;
    readonly plugin: string;
    readonly state: boolean;
    constructor(opts: TransferPluginAllowedProps);
    toString(_: Record<string, TokenData>): string;
}
interface NewInterestRateModelProps extends EVMEventProps {
    pool: string;
    newInterestRateModel: string;
}
export declare class EventNewInterestRateModel extends EVMEvent {
    readonly pool: string;
    readonly newInterestRateModel: string;
    constructor(opts: NewInterestRateModelProps);
    toString(_: Record<string, TokenData>): string;
}
interface NewCreditManagerConnectedProps extends EVMEventProps {
    pool: string;
    creditManager: string;
}
export declare class EventNewCreditManagerConnected extends EVMEvent {
    readonly pool: string;
    readonly creditManager: string;
    constructor(opts: NewCreditManagerConnectedProps);
    toString(_: Record<string, TokenData>): string;
}
interface BorrowForbiddenProps extends EVMEventProps {
    pool: string;
    creditManager: string;
}
export declare class EventBorrowForbidden extends EVMEvent {
    readonly pool: string;
    readonly creditManager: string;
    constructor(opts: BorrowForbiddenProps);
    toString(_: Record<string, TokenData>): string;
}
interface NewExpectedLiquidityLimitProps extends EVMEventProps {
    pool: string;
    underlyingToken: string;
    newLimit: string;
    oldLimit: string;
}
export declare class EventNewExpectedLiquidityLimit extends EVMEvent {
    readonly pool: string;
    readonly underlyingToken: string;
    readonly newLimit: BigNumber;
    readonly prevLimit: BigNumber;
    constructor(opts: NewExpectedLiquidityLimitProps);
    toString(tokenData: Record<string, TokenData>): string;
}
interface NewWithdrawFeeProps extends EVMEventProps {
    pool: string;
    underlyingToken: string;
    newFee: string;
    oldFee: string;
}
export declare class EventNewWithdrawFee extends EVMEvent {
    readonly pool: string;
    readonly underlyingToken: string;
    readonly newFee: number;
    readonly prevFee: number;
    constructor(opts: NewWithdrawFeeProps);
    toString(_: Record<string, TokenData>): string;
}
interface NewPriceFeedProps extends EVMEventProps {
    token: string;
    priceFeed: string;
}
export declare class EventNewPriceFeed extends EVMEvent {
    readonly token: string;
    readonly priceFeed: string;
    constructor(opts: NewPriceFeedProps);
    toString(tokenData: Record<string, TokenData>): string;
}
interface TakeForeverProps extends EVMEventProps {
    creditAccount: string;
    to: string;
}
export declare class EventTakeForever extends EVMEvent {
    readonly creditAccount: string;
    readonly to: string;
    constructor(opts: TakeForeverProps);
    toString(_: Record<string, TokenData>): string;
}
interface PausedProps extends EVMEventProps {
    contract: string;
}
export declare class EventPaused extends EVMEvent {
    readonly contract: string;
    constructor(opts: PausedProps);
    toString(_: Record<string, TokenData>): string;
}
interface UnPausedProps extends EVMEventProps {
    contract: string;
}
export declare class EventUnPaused extends EVMEvent {
    readonly contract: string;
    constructor(opts: UnPausedProps);
    toString(_: Record<string, TokenData>): string;
}
interface PausableAdminAddedProps extends EVMEventProps {
    admin: string;
}
export declare class EventPausableAdminAdded extends EVMEvent {
    readonly admin: string;
    constructor(opts: PausableAdminAddedProps);
    toString(_: Record<string, TokenData>): string;
}
interface PausableAdminRemovedProps extends EVMEventProps {
    admin: string;
}
export declare class EventPausableAdminRemoved extends EVMEvent {
    readonly admin: string;
    constructor(opts: PausableAdminRemovedProps);
    toString(_: Record<string, TokenData>): string;
}
interface UnPausableAdminAddedProps extends EVMEventProps {
    admin: string;
}
export declare class EventUnPausableAdminAdded extends EVMEvent {
    readonly admin: string;
    constructor(opts: UnPausableAdminAddedProps);
    toString(_: Record<string, TokenData>): string;
}
interface UnPausableAdminRemovedProps extends EVMEventProps {
    admin: string;
}
export declare class EventUnPausableAdminRemoved extends EVMEvent {
    readonly admin: string;
    constructor(opts: UnPausableAdminRemovedProps);
    toString(_: Record<string, TokenData>): string;
}
interface TransferOwnershipProps extends EVMEventProps {
    admin: string;
}
export declare class EventTransferOwnership extends EVMEvent {
    readonly newOwner: string;
    constructor(opts: TransferOwnershipProps);
    toString(_: Record<string, TokenData>): string;
}
export {};
