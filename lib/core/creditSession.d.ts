import { BigNumber } from "ethers";
import { CreditOperation } from "./creditOperation";
import { CreditSessionPayload } from "../payload/creditSession";
export declare type CreditSessionStatus = "active" | "closed" | "repaid" | "liquidated";
export declare class CreditSession {
    readonly id: string;
    readonly status: CreditSessionStatus;
    readonly name: string;
    readonly background: string;
    readonly borrower: string;
    readonly creditManager: string;
    readonly account: string;
    readonly since: number;
    readonly sinceDate: string;
    readonly closedAt: number;
    readonly closedAtDate: string;
    readonly initialAmount: BigNumber;
    readonly borrowedAmount: BigNumber;
    readonly totalValue: BigNumber;
    readonly healthFactor: number;
    readonly profit: BigNumber;
    readonly profitPercentage: number;
    readonly score: number;
    readonly operations: Array<CreditOperation>;
    constructor(payload: CreditSessionPayload);
}
