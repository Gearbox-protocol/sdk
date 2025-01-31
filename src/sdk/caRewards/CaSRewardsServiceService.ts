import { type Address, encodeFunctionData } from "viem";

import { iRewardCompressorAbi } from "../abi";
import { SDKConstruct } from "../base";
import { AP_REWARDS_COMPRESSOR } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import { iBaseRewardPoolAbi } from "../sdk-legacy";
import type { Rewards } from "./utils";

export class CaSRewardsServiceService extends SDKConstruct {
  #compressor: Address;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#compressor = sdk.addressProvider.getLatestVersion(
      AP_REWARDS_COMPRESSOR,
    );
  }

  /**
   * Returns voting state for wallet
   * @param wallet
   * @returns
   */
  public async getRewards(creditAccount: Address): Promise<Array<Rewards>> {
    const [rewards] = await this.provider.publicClient.multicall({
      allowFailure: false,
      contracts: [
        {
          address: this.#compressor,
          abi: iRewardCompressorAbi,
          functionName: "getRewards",
          args: [creditAccount],
        },
      ],
    });

    const r = rewards.reduce<Record<string, Rewards>>((acc, r) => {
      const adapter = r.adapter.toLowerCase() as Address;
      const stakedPhantomToken = r.adapter.toLowerCase() as Address;
      const rewardToken = r.rewardToken.toLowerCase() as Address;

      const key = [adapter, stakedPhantomToken].join("-");

      if (!acc[key]) {
        const callData = encodeFunctionData({
          abi: iBaseRewardPoolAbi,
          functionName: "getReward",
          args: [],
        });

        acc[adapter] = {
          adapter,
          stakedPhantomToken,
          calls: [
            {
              target: adapter,
              callData,
            },
          ],
          rewards: [],
        };
      }

      acc[adapter].rewards.push({
        token: rewardToken,
        balance: r.amount,
      });

      return acc;
    }, {});

    return Object.values(r);
  }
}
