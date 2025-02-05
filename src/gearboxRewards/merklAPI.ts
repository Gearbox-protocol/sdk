import { Address } from "viem";

import { URLApi } from "../core/endpoint";
import { BigNumberish } from "../utils/formatter";

interface UserOptions {
  params: {
    user: string;
    chainId: number;

    mainParameter?: string;
    rewardToken?: string;
  };
}

export interface MerkleXYZUserRewards {
  accumulated: BigNumberish;
  decimals: number;
  reasons: Record<
    string,
    {
      accumulated: BigNumberish;
      unclaimed: BigNumberish;
    }
  >;
  symbol: string;
  unclaimed: BigNumberish;
}

export type MerkleXYZUserRewardsResponse = Record<string, MerkleXYZUserRewards>;

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
  tokens: Array<{
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
  }>;
  chain: {
    id: number;
    name: string;
    icon: string;
  };
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
      token: {
        id: string;
        name: string;
        chainId: number;
        address: Address;
        decimals: 18;
        symbol: string;
        displaySymbol: string;
        icon: string;
        verified: boolean;
        isTest: boolean;
        price: number;
      };
      amount: string;
      id: number;
      value: number;
      campaignId: string;
      dailyRewardsRecordid: string;
    }>;
  };
}
export type MerkleXYZV4CampaignsResponse = Array<MerklXYZV4Campaign>;

interface Campaign {
  amountDecimal: string;
  campaignId: string;
  campaignType: number;
  endTimestamp: number;
  rewardToken: string;
  rewardTokenSymbol: string;
  startTimestamp: number;
}

export type MerkleXYZRewardsCampaignsResponse = Array<Campaign>;

// https://api.merkl.xyz/v3/campaignsForMainParameter?chainId=1&mainParameter=0xE2037090f896A858E3168B978668F22026AC52e7

export class MerkleXYZApi {
  static domain = "https://api.merkl.xyz/v3";

  static getUserRewardsUrl = (options: UserOptions) =>
    URLApi.getRelativeUrl([this.domain, "userRewards"].join("/"), options);

  static getGearboxCampaignsUrl = () =>
    "https://api.merkl.xyz/v4/opportunities?name=gearbox";
}
