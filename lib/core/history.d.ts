import { BigNumber } from "ethers";
export declare type BasicEvent = {
    protocol: string;
    txHash: string;
    timestamp: number;
};
export declare type BasicSwapEvent = BasicEvent & {
    from: string;
    fromAmount: BigNumber;
    to: string;
    toAmount: BigNumber;
};
export declare type HistoryEvent = (BasicEvent & {
    action: "OpenCreditAccount";
    initialFunds: BigNumber;
    leverage: number;
}) | (BasicEvent & {
    action: "CloseCreditAccount";
    remainingFunds: BigNumber;
}) | (BasicEvent & {
    action: "LiquidateCreditAccount";
    remainingFunds: BigNumber;
}) | (BasicEvent & {
    action: "IncreaseBorrowedAmount";
    amount: BigNumber;
}) | (BasicEvent & {
    action: "AddCollateral";
    token: string;
    amount: BigNumber;
}) | (BasicEvent & {
    action: "RepayCreditAccount";
    repayAmount: BigNumber;
}) | (BasicEvent & {
    action: "TransferAccount";
    newAccount: string;
}) | (BasicSwapEvent & {
    action: "Swap";
}) | (BasicSwapEvent & {
    action: "Deposit";
}) | (BasicSwapEvent & {
    action: "Withdraw";
});
