import type { Address } from "viem";
import { gaugeCompressorAbi } from "../../abi/compressors/gaugeCompressor.js";
import { SDKConstruct } from "../base/index.js";
import { AP_GAUGE_COMPRESSOR, VERSION_RANGE_310 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { GaugeStakingDataPayload } from "./utils.js";

export class GaugeStakingService extends SDKConstruct {
  #compressor: Address;

  constructor(sdk: GearboxSDK) {
    super(sdk);

    [this.#compressor] = this.sdk.addressProvider.mustGetLatest(
      AP_GAUGE_COMPRESSOR,
      VERSION_RANGE_310,
    );
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
    const gearStaking = this.sdk.gearStakingContract;
    if (!marketFilter) {
      throw new Error("market filter is not set");
    }
    if (!gearStaking) {
      throw new Error("gear staking contract is not set");
    }

    const [gauges, availableBalance, totalBalance, withdrawableAmounts, epoch] =
      await this.client.multicall({
        allowFailure: false,
        contracts: [
          {
            abi: gaugeCompressorAbi,
            address: this.#compressor,
            functionName: "getGauges",
            args: [marketFilter, wallet],
          },
          {
            address: gearStaking.address,
            abi: gearStaking.abi,
            functionName: "availableBalance",
            args: [wallet],
          },
          {
            address: gearStaking.address,
            abi: gearStaking.abi,
            functionName: "balanceOf",
            args: [wallet],
          },
          {
            address: gearStaking.address,
            abi: gearStaking.abi,
            functionName: "getWithdrawableAmounts",
            args: [wallet],
          },
          {
            address: gearStaking.address,
            abi: gearStaking.abi,
            functionName: "getCurrentEpoch",
            args: [],
          },
        ],
        batchSize: 0,
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
