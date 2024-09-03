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

interface CampaignsOptions {
  params: {
    chainId: number;
    mainParameter?: string;
    rewardToken?: string;
  };
}

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
  static getRewardsCampaignsUrl = (options: CampaignsOptions) =>
    URLApi.getRelativeUrl(
      [this.domain, "campaignsForMainParameter"].join("/"),
      options,
    );
}
