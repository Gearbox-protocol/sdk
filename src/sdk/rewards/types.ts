import type { Address } from "viem";
import type { ChainId, DataResponse, Reward } from "../../model/index.js";
import type { OnchainSDK } from "../../onchain/index.js";

/**
 * Claimable Merkl and Turtle rewards.
 **/
export interface IRewards {
  /**
   * Claimable rewards of `wallet`; a chain errors only when every source failed on it.
   **/
  list(wallet: Address, chainIds?: ChainId[]): Promise<DataResponse<Reward[]>>;
}

/**
 * `sdk.rewards` per mode: absent when the SDK reads no chain.
 **/
export interface IRewardsByMode {
  onchain: IRewards;
  offchain: undefined;
  both: IRewards;
}

export interface RewardsKeys {
  /** Raises Merkl's rate limit; the keyless path answers too. */
  merklApiKey?: string;
  /** Turtle is skipped without one: its API answers no keyless request. */
  turtleApiKey?: string;
}

/** What the mapping needs off a chain's SDK, and nothing asynchronous. */
export type RewardsSdk = Pick<
  OnchainSDK,
  "chainId" | "marketRegister" | "tokensMeta"
>;
