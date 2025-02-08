import { Address } from "viem";

import { BigNumberish } from "../utils/formatter";

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

interface MerkleXYZToken {
  id: string;
  name: string;
  chainId: number;
  address: Address;
  decimals: number;
  icon: string;
  verified: boolean;
  isTest: boolean;
  price: number | null;
  symbol: string;
}

export interface MerklXYZV4Campaign {
  chainId: number;
  type: string;
  identifier: Address;
  name: string;
  status: "LIVE" | "PAST";
  action: "LEND" | "BORROW";
  tvl: number;
  apr: number;
  dailyRewards: number;
  tags: Array<string>;
  id: string;
  tokens: Array<MerkleXYZToken>;
  chain: MerkleXYZChain;
  aprRecord: {
    cumulated: number;
    timestamp: string;
    breakdowns: Array<{
      id: number;
      identifier: Address;
      type: "CAMPAIGN";
      value: number;
      aprRecordId: string;
    }>;
  };
  tvlRecord: {
    id: string;
    total: number;
    timestamp: string;
    breakdowns: [];
  };
  rewardsRecord: {
    id: string;
    total: number;
    timestamp: string;
    breakdowns: Array<{
      token: MerkleXYZToken;
      amount: string;
      id: number;
      value: number;
      campaignId: string;
      dailyRewardsRecordid: string;
    }>;
  };
}
export type MerkleXYZV4CampaignsResponse = Array<MerklXYZV4Campaign>;

export interface MerklXYZV4RewardCampaign {
  id: string;
  computeChainId: number;
  distributionChainId: number;
  campaignId: Address;
  rewardTokenId: string;
  amount: string;
  opportunityId: string;
  startTimestamp: string;
  endTimestamp: string;
  creatorAddress: Address;
  params: {
    url: string;
    duration: number;
    blacklist: Array<Address>;
    whitelist: Array<Address>;
    forwarders: Array<Address>;
    targetToken: Address;
    symbolRewardToken: string;
    symbolTargetToken: string;
    decimalsRewardToken: number;
    decimalsTargetToken: number;
  };
  chain: MerkleXYZChain;
  rewardToken: MerkleXYZToken;
  distributionChain: MerkleXYZChain;
  campaignStatus: {
    campaignId: string;
    computedUntil: string;
    processingStarted: string;
    status: "SUCCESS";
    error: string;
    details: string;
  };
}
export type MerkleXYZV4RewardCampaignResponse = Array<MerklXYZV4RewardCampaign>;

// https://api.merkl.xyz/v3/campaignsForMainParameter?chainId=1&mainParameter=0xE2037090f896A858E3168B978668F22026AC52e7

export class MerkleXYZApi {
  static getUserRewardsUrl = (options: UserOptions) =>
    `https://api.merkl.xyz/v4/users/${options.params.user}/rewards?chainId=${options.params.chainId}`;

  static getGearboxCampaignsUrl = () =>
    "https://api.merkl.xyz/v4/opportunities?name=gearbox";
  static getGearboxRewardCampaignUrl = (campaignId: Address) =>
    `https://api.merkl.xyz/v4/campaigns?campaignId=${campaignId}`;
}
