import { BigNumber } from "ethers";
import { TokenData } from "../tokens/tokenData";
import { EVMTx, EVMTxProps } from "./eventOrTx";
export interface TxSerialized {
    type: "TxAddLiquidity" | "TxRemoveLiquidity" | "TxSwap" | "TxAddCollateral" | "TxIncreaseBorrowAmount" | "TxOpenAccount" | "TxRepayAccount" | "TxCloseAccount" | "TxApprove" | "TxOpenMultitokenAccount";
    content: string;
}
export declare class TxSerializer {
    static serialize(items: Array<EVMTx>): string;
    static deserialize(data: string): Array<EVMTx>;
}
interface AddLiquidityProps extends EVMTxProps {
    amount: BigNumber;
    underlyingToken: string;
    pool: string;
}
export declare class TxAddLiquidity extends EVMTx {
    readonly amount: BigNumber;
    readonly underlyingToken: string;
    readonly pool: string;
    constructor(opts: AddLiquidityProps);
    toString(tokenData: Record<string, TokenData>): string;
    serialize(): TxSerialized;
}
interface RemoveLiquidityProps extends EVMTxProps {
    amount: BigNumber;
    dieselToken: string;
    pool: string;
}
export declare class TxRemoveLiquidity extends EVMTx {
    readonly amount: BigNumber;
    readonly dieselToken: string;
    readonly pool: string;
    constructor(opts: RemoveLiquidityProps);
    toString(tokenData: Record<string, TokenData>): string;
    serialize(): TxSerialized;
}
interface SwapProps extends EVMTxProps {
    protocol: string;
    operation: string;
    amountFrom: BigNumber;
    amountTo?: BigNumber;
    tokenFrom: string;
    tokenTo?: string;
    creditManager: string;
}
export declare class TXSwap extends EVMTx {
    readonly protocol: string;
    readonly operation: string;
    readonly amountFrom: BigNumber;
    readonly amountTo?: BigNumber;
    readonly tokenFrom: string;
    readonly tokenTo?: string;
    readonly creditManager: string;
    constructor(opts: SwapProps);
    toString(tokenData: Record<string, TokenData>): string;
    serialize(): TxSerialized;
}
interface AddCollateralProps extends EVMTxProps {
    amount: BigNumber;
    addedToken: string;
    creditManager: string;
}
export declare class TxAddCollateral extends EVMTx {
    readonly amount: BigNumber;
    readonly addedToken: string;
    readonly creditManager: string;
    constructor(opts: AddCollateralProps);
    toString(tokenData: Record<string, TokenData>): string;
    serialize(): TxSerialized;
}
interface IncreaseBorrowAmountProps extends EVMTxProps {
    amount: BigNumber;
    underlyingToken: string;
    creditManager: string;
}
export declare class TxIncreaseBorrowAmount extends EVMTx {
    readonly amount: BigNumber;
    readonly underlyingToken: string;
    readonly creditManager: string;
    constructor(opts: IncreaseBorrowAmountProps);
    toString(tokenData: Record<string, TokenData>): string;
    serialize(): TxSerialized;
}
interface OpenAccountProps extends EVMTxProps {
    amount: BigNumber;
    underlyingToken: string;
    leverage: number;
    creditManager: string;
}
export declare class TxOpenAccount extends EVMTx {
    readonly amount: BigNumber;
    readonly underlyingToken: string;
    readonly leverage: number;
    readonly creditManager: string;
    constructor(opts: OpenAccountProps);
    toString(tokenData: Record<string, TokenData>): string;
    serialize(): TxSerialized;
}
interface TxOpenMultitokenAccountProps extends EVMTxProps {
    borrowedAmount: BigNumber;
    creditManager: string;
    underlyingToken: string;
    assets: Array<string>;
}
export declare class TxOpenMultitokenAccount extends EVMTx {
    readonly borrowedAmount: BigNumber;
    readonly creditManager: string;
    readonly underlyingToken: string;
    readonly assets: Array<string>;
    constructor(opts: TxOpenMultitokenAccountProps);
    toString(tokenData: Record<string, TokenData>): string;
    serialize(): TxSerialized;
}
interface RepayAccountProps extends EVMTxProps {
    creditManager: string;
}
export declare class TxRepayAccount extends EVMTx {
    readonly creditManager: string;
    constructor(opts: RepayAccountProps);
    toString(_: Record<string, TokenData>): string;
    serialize(): TxSerialized;
}
interface CloseAccountProps extends EVMTxProps {
    creditManager: string;
}
export declare class TxCloseAccount extends EVMTx {
    readonly creditManager: string;
    constructor(opts: CloseAccountProps);
    toString(_: Record<string, TokenData>): string;
    serialize(): TxSerialized;
}
interface ApproveProps extends EVMTxProps {
    token: string;
}
export declare class TxApprove extends EVMTx {
    readonly token: string;
    constructor(opts: ApproveProps);
    toString(tokenData: Record<string, TokenData>): string;
    serialize(): TxSerialized;
}
export {};
