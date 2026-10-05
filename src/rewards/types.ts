import type { Address } from "viem";
import type {
  ChainId,
  PointsProgramPnL,
  Token,
  TokenAmount,
} from "../model/index.js";
import type { OnchainSDK } from "../onchain/index.js";

/**
 * One claimable token reward, denominated and priced.
 *
 * Both tokens arrive resolved, so a consumer neither looks one up nor
 * reassembles one out of the loose fields a source sends.
 */
export interface MerklReward {
  /** Where the reward is claimed. */
  readonly source: "merkl" | "turtle";
  readonly chainId: ChainId;
  /** Market pool whose depositors the campaign rewards. */
  readonly pool: Address;
  /** That pool's share token — what the campaign is keyed on. */
  readonly poolToken: Token;
  /**
   * The incentive token being handed out, how much of it is claimable
   * (distributed minus already claimed, always > 0) and what that is worth.
   *
   * Priced by the source, not by the market oracles: a campaign's incentive
   * token is rarely collateral in the pool it incentivises, so the oracles
   * usually do not know it — GEAR, which most Gearbox campaigns pay in, among
   * them. `valueUsd` is `null` for a token the source does not price either.
   */
  readonly amount: TokenAmount;
}

/** Points have no token and no price, and are not claimed. */
export interface PointsReward extends Omit<MerklReward, "amount"> {
  readonly points: PointsProgramPnL;
}

export type Reward = MerklReward | PointsReward;

/** What the mapping needs off a chain's SDK, and nothing asynchronous. */
export type RewardsSdk = Pick<
  OnchainSDK,
  "chainId" | "marketRegister" | "tokensMeta"
>;
