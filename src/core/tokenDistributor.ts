export interface TokenShare {
  holder: string;
  amount: bigint;
  share: number;
  isCompany: boolean;
}

export enum VotingPower {
  A, // A-type voting power & A-type vesting parameters
  B, // B-type voting power & B-type vesting parameters
  ZERO_VOTING_POWER, // zero voting power & B-type vesting parameters
}
