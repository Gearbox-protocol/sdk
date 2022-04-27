import { BigNumber, ethers, Signer } from "ethers";
import { IAppCreditManager } from "../types";
import { CreditManagerDataPayload, CreditManagerStatPayload } from "../payload/creditManager";
export declare class CreditManagerData {
    readonly id: string;
    readonly address: string;
    readonly underlyingToken: string;
    readonly isWETH: boolean;
    readonly canBorrow: boolean;
    readonly borrowRate: number;
    readonly minAmount: BigNumber;
    readonly maxAmount: BigNumber;
    readonly maxLeverageFactor: number;
    readonly availableLiquidity: BigNumber;
    readonly allowedTokens: Array<string>;
    readonly adapters: Record<string, string>;
    readonly version: number;
    constructor(payload: CreditManagerDataPayload);
    validateOpenAccount(balance: BigNumber, decimals: number, amount_BN: BigNumber, leverage: number): string | null;
    getContractETH(signer: Signer | ethers.providers.Provider): IAppCreditManager;
    get isPaused(): boolean;
}
export declare function calcMaxIncreaseBorrow(healthFactor: number, borrowAmountPlusInterest: BigNumber, maxLeverageFactor: number): BigNumber;
export declare function calcHealthFactorAfterIncreasingBorrow(healthFactor: number | undefined, borrowAmountPlusInterest: BigNumber | undefined, additional: BigNumber): number;
export declare function calcHealthFactorAfterAddingCollateral(healthFactor: number | undefined, borrowAmountPlusInterest: BigNumber | undefined, additionalCollateral: BigNumber): number;
export declare class CreditManagerStat extends CreditManagerData {
    readonly uniqueUsers: number;
    readonly openedAccountsCount: number;
    readonly totalOpenedAccounts: number;
    readonly totalClosedAccounts: number;
    readonly totalRepaidAccounts: number;
    readonly totalLiquidatedAccounts: number;
    readonly totalBorrowed: BigNumber;
    readonly cumulativeBorrowed: BigNumber;
    readonly totalRepaid: BigNumber;
    readonly totalProfit: BigNumber;
    readonly totalLosses: BigNumber;
    constructor(payload: CreditManagerStatPayload);
}
