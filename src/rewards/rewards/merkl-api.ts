import axios from "axios";
import type { Address } from "viem";

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
    amount: string;
    claimed: string;
    pending: string;
    proofs: Array<Address>;
    token: {
      address: Address;
      chainId: number;
      symbol: string;
      decimals: number;
    };
    breakdowns: Array<{
      reason: string;
      amount: string;
      claimed: string;
      pending: string;
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
  private constructor() {}

  static defaultDomain = "https://api.merkl.xyz";
  static angleDomain = "https://api-merkl.angle.money";
  static apiKeyHeader = "X-API-Key";

  static fetchWithFallback = async <T>(
    getUrl: (domain: string) => string,
    apiKey?: string,
  ) => {
    const headers = apiKey
      ? { [MerkleXYZApi.apiKeyHeader]: apiKey }
      : undefined;

    try {
      return await axios.get<T>(getUrl(MerkleXYZApi.defaultDomain), {
        headers,
      });
    } catch {
      return await axios.get<T>(getUrl(MerkleXYZApi.angleDomain), {
        headers,
      });
    }
  };

  static getUserRewardsUrl = (options: UserOptions) => (domain: string) =>
    `${domain}/v4/users/${options.params.user}/rewards?chainId=${options.params.chainId}`;
}
