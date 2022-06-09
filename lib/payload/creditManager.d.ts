import { BigNumberish } from "ethers";
export interface AdapterPayload {
    allowedContract: string;
    adapter: string;
}
export interface CreditManagerDataPayload {
    addr: string;
    underlying?: string;
    isWETH?: boolean;
    canBorrow?: boolean;
    borrowRate?: BigNumberish;
    minAmount?: BigNumberish;
    maxAmount?: BigNumberish;
    maxLeverageFactor?: BigNumberish;
    availableLiquidity?: BigNumberish;
    collateralTokens?: Array<string>;
    adapters?: Array<AdapterPayload>;
    liquidationThresholds?: Array<BigNumberish>;
    version?: number;
    creditFacade?: string;
    isDegenMode?: boolean;
    degenNFT?: string;
    isIncreaseDebtForbidden?: boolean;
    forbiddenTokenMask?: BigNumberish;
}
export interface CreditManagerStatPayload {
    addr: string;
    underlyingToken?: string;
    isWETH?: boolean;
    canBorrow?: boolean;
    borrowRate?: BigNumberish;
    minAmount?: BigNumberish;
    maxAmount?: BigNumberish;
    maxLeverageFactor?: BigNumberish;
    availableLiquidity?: BigNumberish;
    allowedTokens?: Array<string>;
    allowedContracts?: Array<string>;
    uniqueUsers: number;
    openedAccountsCount?: number;
    totalOpenedAccounts?: number;
    totalClosedAccounts?: number;
    totalRepaidAccounts?: number;
    totalLiquidatedAccounts?: number;
    totalBorrowed?: BigNumberish;
    cumulativeBorrowed?: BigNumberish;
    totalRepaid?: BigNumberish;
    totalProfit?: BigNumberish;
    totalLosses?: BigNumberish;
}
