import type { Address } from "viem";
import type { ChainId, DataResponse } from "../../model/index.js";
import type { Reward } from "../../rewards/index.js";

/**
 * Claimable Merkl and Turtle rewards.
 **/
export interface IRewards {
  /**
   * {@inheritDoc RewardsService.list}
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
