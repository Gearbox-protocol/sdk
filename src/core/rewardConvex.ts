import {
  AdapterInterface,
  contractParams,
  contractsByAddress,
  ConvexPoolParams,
  MCall,
  multicall,
  NetworkType,
  SupportedContract,
  SupportedToken,
  toBigInt,
  tokenDataByNetwork,
} from "@gearbox-protocol/sdk-gov";
import { BigNumber, providers } from "ethers";

import { getCVXMintAmount } from "../apy";
import {
  IConvexToken__factory,
  IConvexV1BaseRewardPoolAdapter__factory,
} from "../types";
import { IConvexTokenInterface } from "../types/@gearbox-protocol/integrations-v2/contracts/integrations/convex/IConvexToken";
import { IConvexV1BaseRewardPoolAdapterInterface } from "../types/@gearbox-protocol/integrations-v2/contracts/interfaces/convex/IConvexV1BaseRewardPoolAdapter.sol/IConvexV1BaseRewardPoolAdapter";
import { CreditAccountData } from "./creditAccount";
import { CreditManagerData } from "./creditManager";
import { AdapterWithType, Rewards } from "./rewardClaimer";

export interface RewardDistribution {
  adapter: string;
  contractAddress: string;
  contract: SupportedContract;
  token: SupportedToken;
}

interface MCallPreparation {
  calls: Array<MCall<IConvexV1BaseRewardPoolAdapterInterface>>;
  distribution: Array<RewardDistribution>;
}

export class RewardConvex {
  static poolInterface =
    IConvexV1BaseRewardPoolAdapter__factory.createInterface();

  static async findRewards(
    ca: CreditAccountData,
    cm: CreditManagerData,
    network: NetworkType,
    provider: providers.Provider,
  ): Promise<Array<Rewards>> {
    const { calls, distribution } = RewardConvex.prepareMultiCalls(
      ca.addr,
      cm,
      network,
    );

    const mcalls: Array<
      | MCall<IConvexV1BaseRewardPoolAdapterInterface>
      | MCall<IConvexTokenInterface>
    > = calls;

    mcalls.push({
      address: tokenDataByNetwork[network].CVX,
      interface: IConvexToken__factory.createInterface(),
      method: "totalSupply()",
    });

    const rewards = await multicall<Array<BigNumber>>(mcalls, provider);

    const totalSupply = rewards.pop();

    const results = RewardConvex.parseResults(rewards, distribution);

    results.forEach(r => {
      r.rewards.CVX = getCVXMintAmount(
        r.rewards.CRV || 0n,
        toBigInt(totalSupply!),
      );
    });

    return results;
  }

  static findAdapters(cm: CreditManagerData): Array<AdapterWithType> {
    const convexPools: Array<SupportedContract> = Object.entries(contractParams)
      .filter(
        ([_, params]) =>
          params.type === AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
      )
      .map(([contract]) => contract as SupportedContract);

    return Object.entries(cm.adapters)
      .map(([contract, adapter]) => ({
        adapter,
        contractAddress: contract,
        contract: contractsByAddress[contract.toLowerCase()],
      }))
      .filter(a => convexPools.includes(a.contract));
  }

  static prepareMultiCalls(
    creditAccount: string,
    cm: CreditManagerData,
    network: NetworkType,
  ): MCallPreparation {
    const calls: Array<MCall<IConvexV1BaseRewardPoolAdapterInterface>> = [];
    const distribution: Array<RewardDistribution> = [];

    const adapters = this.findAdapters(cm);

    for (let a of adapters) {
      calls.push({
        address: a.contractAddress,
        interface: RewardConvex.poolInterface,
        method: "earned(address)",
        params: [creditAccount],
      });
      distribution.push({
        contractAddress: a.contractAddress,
        adapter: a.adapter,
        contract: a.contract,
        token: "CRV",
      });

      const params = contractParams[a.contract] as ConvexPoolParams;

      for (let er of params.extraRewards) {
        calls.push({
          address: er.poolAddress[network],
          interface: RewardConvex.poolInterface,
          method: "earned(address)",
          params: [creditAccount],
        });
        distribution.push({
          contractAddress: a.contractAddress,
          adapter: a.adapter,
          contract: a.contract,
          token: er.rewardToken,
        });
      }
    }
    return {
      calls,
      distribution,
    };
  }

  static parseResults(
    rewards: Array<BigNumber>,
    distribution: Array<RewardDistribution>,
  ): Array<Rewards> {
    const result: Partial<Record<SupportedContract, Rewards>> = {};

    const callData =
      RewardConvex.poolInterface.encodeFunctionData("getReward()");

    for (let i = 0; i < rewards.length; i++) {
      const { contract, adapter, token } = distribution[i];
      const reward = rewards[i];

      if (!reward.isZero()) {
        if (!result[contract]) {
          result[contract] = {
            contract,
            rewards: {},
            calls: [
              {
                target: adapter,
                callData,
              },
            ],
          };
        }
        result[contract]!.rewards[token] = BigInt(reward.toString());
      }
    }

    return Object.values(result);
  }
}
