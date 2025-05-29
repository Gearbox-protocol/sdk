import type { Address } from "viem";

import type { BigNumberish } from "../utils/formatter.js";

interface UserOptions {
  params: {
    user: string;
    chainId: number;
  };
}

export interface MerkleXYZUserRewardsV4 {
  chain: MerkleXYZChain;
  rewards: Array<{
    root: Address;
    recipient: Address;
    amount: BigNumberish;
    claimed: BigNumberish;
    pending: BigNumberish;
    proofs: Array<Address>;
    token: {
      address: Address;
      chainId: number;
      symbol: string;
      decimals: number;
    };
    breakdowns: Array<{
      reason: string;
      amount: BigNumberish;
      claimed: BigNumberish;
      pending: BigNumberish;
      campaignId: Address;
    }>;
  }>;
}
export type MerkleXYZUserRewardsV4Response = Array<MerkleXYZUserRewardsV4>;

interface MerkleXYZChain {
  id: number;
  name: string;
  icon: string;
}

// https://api.merkl.xyz/v3/campaignsForMainParameter?chainId=1&mainParameter=0xE2037090f896A858E3168B978668F22026AC52e7

export class MerkleXYZApi {
  static getUserRewardsUrl = (options: UserOptions) =>
    `https://api.merkl.xyz/v4/users/${options.params.user}/rewards?chainId=${options.params.chainId}`;
}
