import { BigNumber, BytesLike } from "ethers";
import { SwapType } from "./tradeTypes";
export interface CloseTradePath {
    path: Array<string>;
    amountOutMin: BigNumber;
}
export declare class TradePath {
    readonly swapType: SwapType;
    readonly amount: BigNumber;
    readonly rate: BigNumber;
    readonly path: Array<string>;
    readonly expectedAmount: BigNumber;
    readonly pathUniV3: BytesLike | undefined;
    readonly i: number | undefined;
    readonly j: number | undefined;
    readonly operationName: string | undefined;
    constructor(params: {
        swapType: SwapType;
        amount: BigNumber;
        path: Array<string>;
        expectedAmount: BigNumber;
        pathUniV3?: BytesLike;
        i?: number;
        j?: number;
        operationName?: string;
    });
    getExpectedAmountWithSlippage(slippage: number): BigNumber;
    getAmountInMax(slippage: number): BigNumber;
    getAmountOutMin(slippage: number): BigNumber;
    get from(): string;
    get to(): string;
    getFromAmount(slippage: number): BigNumber;
    getToAmount(slippage: number): BigNumber;
}
