import { BigNumber, ethers } from "ethers";
import { CreditManagerData } from "../core/creditManager";
import { MultiCall } from "../core/multicall";
import { SupportedToken } from "../core/token";
import { NetworkType } from "../core/constants";
import { CreditAccountData } from "../core/creditAccount";
import { TradeAction } from "../core/tradeTypes";
export declare class Path {
    readonly calls: Array<MultiCall>;
    readonly balances: Record<SupportedToken, BigNumber>;
    readonly pool: SupportedToken;
    readonly creditManager: CreditManagerData;
    readonly creditAccount: CreditAccountData;
    readonly networkType: NetworkType;
    readonly provider: ethers.providers.Provider;
    readonly totalGasLimit: BigNumber;
    constructor(opts: {
        balances: Record<SupportedToken, BigNumber>;
        pool: SupportedToken;
        creditManager: CreditManagerData;
        creditAccount: CreditAccountData;
        networkType: NetworkType;
        provider: ethers.providers.Provider;
        totalGasLimit: BigNumber;
    });
    private comparedByPriority;
    getBestPath(): Promise<Path>;
}
export interface ActionData {
    callData: MultiCall;
    amountOut: BigNumber;
    gasLimit: BigNumber;
}
export declare abstract class PathAsset {
    abstract getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
    getUniswapV2SwapData(adapterAddress: string, currentTokenAddress: string, currentBalance: BigNumber, nextTokenAddress: string, p: Path): Promise<ActionData>;
    getUniswapV3SwapData(adapterAddress: string, currentTokenAddress: string, currentBalance: BigNumber, nextTokenAddress: string, p: Path): Promise<ActionData>;
    getCurveActionData(adapterAddress: string, currentToken: SupportedToken, currentBalance: BigNumber, nextToken: SupportedToken, p: Path): Promise<ActionData>;
    getActionData(swapAction: TradeAction, currentTokenAddress: string, currentToken: SupportedToken, currentBalance: BigNumber, nextTokenAddress: string, nextToken: SupportedToken, p: Path): Promise<ActionData>;
    getYearnActionData(lpAction: TradeAction, currentBalance: BigNumber, p: Path): Promise<ActionData>;
}
