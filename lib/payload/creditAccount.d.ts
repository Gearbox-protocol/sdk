import { BigNumberish } from "ethers";
export interface TokenBalancePayload {
    token: string;
    balance: BigNumberish;
    isAllowed: boolean;
}
export interface CreditAccountDataPayload {
    addr: string;
    borrower: string;
    inUse: boolean;
    creditManager: string;
    underlyingToken: string;
    borrowedAmountPlusInterest: BigNumberish;
    totalValue: BigNumberish;
    healthFactor: BigNumberish;
    borrowRate: BigNumberish;
    balances?: Array<TokenBalancePayload>;
}
export interface CreditAccountDataExtendedPayload extends CreditAccountDataPayload {
    repayAmount: BigNumberish;
    liquidationAmount: BigNumberish;
    canBeClosed?: boolean;
    borrowedAmount: BigNumberish;
    cumulativeIndexAtOpen: BigNumberish;
    since: BigNumberish;
}
