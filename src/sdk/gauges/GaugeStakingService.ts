import { MULTICALL_ADDRESS } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { dataCompressorV3Abi } from "../abi";
import { SDKConstruct } from "../base";
import { AP_DATA_COMPRESSOR } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { GaugeStakingDataPayload } from "./utils";

export class GaugeStakingService extends SDKConstruct {
  #compressor: Address;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#compressor = sdk.addressProvider.getLatestVersion(AP_DATA_COMPRESSOR);
  }

  /**
   * Returns voting state for wallet
   * @param wallet
   * @returns
   */
  public async getGaugeStakingData(
    wallet: Address,
  ): Promise<GaugeStakingDataPayload> {
    const [gauges, availableBalance, totalBalance, withdrawableAmounts, epoch] =
      await this.provider.publicClient.multicall({
        allowFailure: false,
        multicallAddress: MULTICALL_ADDRESS,
        contracts: [
          {
            address: this.#compressor,
            abi: dataCompressorV3Abi,
            functionName: "getGaugesV3Data",
            args: [wallet],
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
