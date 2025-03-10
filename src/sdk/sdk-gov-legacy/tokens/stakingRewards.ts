import type { StakingRewardsContract } from "../contracts";
import type { SupportedToken, TokenBase } from "./token";
import type { TokenNetwork } from "./tokenType";
import { TokenType } from "./tokenType";

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
