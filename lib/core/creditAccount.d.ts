import { BigNumber } from "ethers";
import { CreditAccountDataExtendedPayload, CreditAccountDataPayload } from "../payload/creditAccount";
import { TokenData } from "../tokens/tokenData";
export declare type Balance = {
    address: string;
    balance: BigNumber;
};
export declare class CreditAccountData {
    readonly id: string;
    readonly addr: string;
    readonly borrower: string;
    readonly inUse: boolean;
    readonly creditManager: string;
    readonly underlyingToken: string;
    borrowedAmountPlusInterest: BigNumber;
    totalValue: BigNumber;
    healthFactor: number;
    borrowRate: number;
    readonly allowedTokens: Array<string>;
    readonly allTokens: Array<string>;
    balances: Record<string, BigNumber>;
    allBalances: Record<string, BigNumber>;
    isDeleting: boolean;
    readonly version: number;
    constructor(payload: CreditAccountDataPayload);
    balancesSorted(prices: Record<string, BigNumber>, tokens: Record<string, TokenData>): Array<Balance>;
}
export declare function sortBalances(balances: Record<string, BigNumber>, prices: Record<string, BigNumber>, tokens: Record<string, TokenData>): Array<[string, BigNumber]>;
export declare function tokensAbcComparator(t1?: TokenData, t2?: TokenData): 1 | -1;
export declare function amountAbcComparator(t1: BigNumber, t2: BigNumber): 1 | -1;
export declare class CreditAccountDataExtended extends CreditAccountData {
    readonly repayAmount: BigNumber;
    readonly liquidationAmount: BigNumber;
    readonly borrowedAmount: BigNumber;
    readonly canBeClosed: boolean;
    readonly cumulativeIndexAtOpen: BigNumber;
    readonly since: number;
    constructor(payload: CreditAccountDataExtendedPayload);
}
