import {
  MULTICALL_ADDRESS,
  NetworkType,
  PartialRecord,
  Protocols,
  SupportedContract,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";
import { Address, PublicClient } from "viem";

import { MultiCall } from "../../pathfinder/core";
import { CreditAccountData } from "../creditAccount";
import { CreditManagerData } from "../creditManager";
import { RewardConvex } from "./rewardConvex";
import { StakingRewards } from "./stakingRewards";

export interface Rewards {
  contract: SupportedContract;
  protocol: Protocols.Aura | Protocols.Convex | Protocols.Sky;

  rewards: PartialRecord<SupportedToken, bigint>;
  calls: Array<MultiCall>;
}

export interface AdapterWithType {
  contractAddress: Address;
  adapter: Address;
  contract: SupportedContract;
}

export class RewardClaimer {
  static async findRewards(
    ca: CreditAccountData,
    cm: CreditManagerData,
    network: NetworkType,
    provider: PublicClient,
  ): Promise<Array<Rewards>> {
    const tokens = await RewardClaimer.findRewardTokens(cm, provider);

    const [convex, staking] = await Promise.all([
      RewardConvex.findRewards(ca, cm, network, provider),

      StakingRewards.findRewards(
        ca,
        provider,
        tokens.staking.adapters,
        tokens.staking.tokens,
      ),
    ]);
    return [...convex, ...staking];
  }

  static async findRewardTokens(cm: CreditManagerData, provider: PublicClient) {
    const { calls: stakingCalls, adapters: stakingAdapters } =
      StakingRewards.getRewardTokenCalls(cm);

    const stakingTotal = stakingCalls.flat(1);

    const allCalls = [...stakingTotal];

    const response = (await provider.multicall({
      allowFailure: false,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: allCalls,
    })) as Array<Address>;

    const takingEnd = stakingTotal.length;
    const stakingRewardTokensResponse = response.slice(0, takingEnd);

    return {
      staking: {
        adapters: stakingAdapters,
        tokens: stakingRewardTokensResponse,
      },
    };
  }
}
