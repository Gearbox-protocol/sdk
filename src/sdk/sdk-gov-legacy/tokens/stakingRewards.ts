import type { StakingRewardsContract } from "../contracts/index.js";
import type { SupportedToken, TokenBase } from "./token.js";
import type { TokenNetwork } from "./tokenType.js";
import { TokenType } from "./tokenType.js";

export type StakingRewardsPhantomToken = "stkUSDS";

export type StakingRewardsPhantomTokenData = {
  symbol: StakingRewardsPhantomToken;
  type: Partial<Record<TokenNetwork, TokenType.STAKING_REWARDS_PHANTOM_TOKEN>>;
  underlying: SupportedToken;
  pool: StakingRewardsContract;
} & TokenBase;

export const stakingRewardsPhantomTokens: Record<
  StakingRewardsPhantomToken,
  StakingRewardsPhantomTokenData
> = {
  stkUSDS: {
    name: "Sky staked USDS",
    symbol: "stkUSDS",
    pool: "SKY_STAKING_REWARDS",
    type: {
      AllNetworks: TokenType.STAKING_REWARDS_PHANTOM_TOKEN,
    },
    underlying: "USDS",
  },
};

export const stakingRewardsTokens: Record<
  StakingRewardsPhantomToken,
  StakingRewardsPhantomTokenData
> = {
  ...stakingRewardsPhantomTokens,
};

export const isStakingRewardsPhantomToken = (
  t: unknown,
): t is StakingRewardsPhantomToken =>
  typeof t === "string" &&
  !!stakingRewardsTokens[t as StakingRewardsPhantomToken];
