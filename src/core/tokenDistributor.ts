import {BigNumber} from "ethers";

export interface TokenShare {
  holder: string;
  amount: BigNumber;
  share: number;
  isCompany: boolean;
}

export enum VotingPower {
  A, // A-type voting power & A-type vesting parameters
  B, // B-type voting power & B-type vesting parameters
  ZERO_VOTING_POWER, // zero voting power & B-type vesting parameters
}
