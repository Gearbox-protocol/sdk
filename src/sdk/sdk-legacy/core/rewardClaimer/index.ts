import type { Address, PublicClient } from "viem";

import type { NetworkType } from "../../../chain";
import { MULTICALL_ADDRESS } from "../../../constants";
import type {
  Protocols,
  SupportedContract,
  SupportedToken,
} from "../../../sdk-gov-legacy";
import type { MultiCall } from "../../../types";
import type { PartialRecord } from "../../../utils";
import type { TokenData } from "../../tokens/tokenData";
import type { CreditAccountData_Legacy } from "../creditAccount";
import type { CreditManagerData_Legacy } from "../creditManager";
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
    ca: CreditAccountData_Legacy,
    cm: CreditManagerData_Legacy,
    network: NetworkType,
    provider: PublicClient,
    tokensList: Record<Address, TokenData>,
  ): Promise<Array<Rewards>> {
    const tokens = await RewardClaimer.findRewardTokens(cm, provider);

    const [convex, staking] = await Promise.all([
      RewardConvex.findRewards(ca, cm, network, provider),

      StakingRewards.findRewards(
        ca,
        provider,
        tokens.staking.adapters,
        tokens.staking.tokens,
        tokensList,
      ),
    ]);
    return [...convex, ...staking];
  }

  static async findRewardTokens(
    cm: CreditManagerData_Legacy,
    provider: PublicClient,
  ) {
    const { calls: stakingCalls, adapters: stakingAdapters } =
      StakingRewards.getRewardTokenCalls(cm);

    const stakingTotal = stakingCalls.flat(1);

    const response = await provider.multicall({
      allowFailure: true,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: [...stakingTotal],
    });

    const stakingEnd = stakingTotal.length;
    const stakingRewardTokensResponse = response.slice(0, stakingEnd);

    return {
      staking: {
        adapters: stakingAdapters,
        tokens: stakingRewardTokensResponse.map(
          r => r?.result as Address | undefined,
        ),
      },
    };
  }
}
