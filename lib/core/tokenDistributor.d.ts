import { BigNumber } from "ethers";
export interface TokenShare {
    holder: string;
    amount: BigNumber;
    share: number;
    isCompany: boolean;
}
export declare enum VotingPower {
    A = 0,
    B = 1,
    ZERO_VOTING_POWER = 2
}
