import { BigNumber } from "ethers";

export type BasicEvent = {
    protocol: string; // address of creditManager. Address of target account for EXECUTE event
    txHash: string;
    timestamp: number; // timestamp in Unix format
};

export type BasicSwapEvent = BasicEvent & {
    from: string; //address
    fromAmount: BigNumber;
    to: string; // address
    toAmount: BigNumber;
};

export type HistoryEvent =
    | (BasicEvent & {
    action: "OpenCreditAccount";
    initialFunds: BigNumber;
    leverage: number; // x100, so 420 => 4.2
})
    | (BasicEvent & {
    action: "CloseCreditAccount";
    remainingFunds: BigNumber;
})
    | (BasicEvent & {
    action: "LiquidateCreditAccount";
    remainingFunds: BigNumber;
})
    | (BasicEvent & {
    action: "IncreaseBorrowedAmount";
    amount: BigNumber;
})
    | (BasicEvent & {
    action: "AddCollateral";
    token: string; // token address
    amount: BigNumber;
})
    | (BasicEvent & {
    action: "RepayCreditAccount";
    repayAmount: BigNumber;
})
    | (BasicEvent & {
    action: "TransferAccount";
    newAccount: string; // Address
})
    | (BasicSwapEvent & {
    action: "Swap";
})
    | (BasicSwapEvent & {
    action: "Deposit";
})
    | (BasicSwapEvent & {
    action: "Withdraw";
});
