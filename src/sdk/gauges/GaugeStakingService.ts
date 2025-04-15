import type { Address } from "viem";

import { iGaugeCompressorAbi } from "../../abi/compressors.js";
import { SDKConstruct } from "../base/index.js";
import { AP_GAUGE_COMPRESSOR } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { GaugeStakingDataPayload } from "./utils.js";

export class GaugeStakingService extends SDKConstruct {
  #compressor: Address;

  constructor(sdk: GearboxSDK) {
    super(sdk);

    [this.#compressor] =
      this.sdk.addressProvider.getLatestVersion(AP_GAUGE_COMPRESSOR);
  }

  /**
   * Returns voting state for wallet
   * @param wallet
   * @returns
   */
  public async getGaugeStakingData(
    wallet: Address,
  ): Promise<GaugeStakingDataPayload> {
    const marketFilter = this.sdk.marketRegister.marketFilter;
    if (!marketFilter) throw new Error("market filter is not set");

    const [gauges, availableBalance, totalBalance, withdrawableAmounts, epoch] =
      await this.provider.publicClient.multicall({
        allowFailure: false,
        contracts: [
          {
            abi: iGaugeCompressorAbi,
            address: this.#compressor,
            functionName: "getGauges",
            args: [marketFilter, wallet],
          },
          {
            address: this.sdk.gearStakingContract.address,
            abi: this.sdk.gearStakingContract.abi,
            functionName: "availableBalance",
            args: [wallet],
          },
          {
            address: this.sdk.gearStakingContract.address,
            abi: this.sdk.gearStakingContract.abi,
            functionName: "balanceOf",
            args: [wallet],
          },
          {
            address: this.sdk.gearStakingContract.address,
            abi: this.sdk.gearStakingContract.abi,
            functionName: "getWithdrawableAmounts",
            args: [wallet],
          },
          {
            address: this.sdk.gearStakingContract.address,
            abi: this.sdk.gearStakingContract.abi,
            functionName: "getCurrentEpoch",
            args: [],
          },
        ],
      });

    return {
      availableBalance,
      totalBalance,
      epoch,
      withdrawableAmounts: {
        withdrawableNow: withdrawableAmounts[0],
        withdrawableInEpochs: withdrawableAmounts[1],
      },

      voteParams: gauges.reduce<GaugeStakingDataPayload["voteParams"]>(
        (acc, v) => {
          acc[v.addr] = {
            pool: v.pool,
            gauge: v.addr,
            quotaParams: v.quotaParams.reduce<
              GaugeStakingDataPayload["voteParams"][Address]["quotaParams"]
            >((acc, q) => {
              acc[q.token] = {
                token: q.token,
                stakerVotesLpSide: q.stakerVotesLpSide,
                stakerVotesCaSide: q.stakerVotesCaSide,
              };

              return acc;
            }, {}),
          };

          return acc;
        },
        {},
      ),
    };
  }
}
