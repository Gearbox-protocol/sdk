import type { Address } from "viem";

import { dataCompressorV3Abi } from "../abi";
import { SDKConstruct } from "../base";
import { chains as CHAINS } from "../chain";
import type { GearboxSDK } from "../GearboxSDK";
import { TESTNET_CHAINS } from "../sdk-legacy";
import type { GaugeStakingDataPayload } from "./utils";

// TODO: should get address from sdk; currently these addresses are datacompressor v3 adresses
export const GAUGE_COMPRESSORS: Record<number, Address> = {
  [CHAINS.Mainnet.id]: "0x104c4e209329524adb0febE8b6481346a6eB75C6",
  [CHAINS.Arbitrum.id]: "0x88aa4FbF86392cBF6f6517790E288314DE03E181",
  [CHAINS.Optimism.id]: "0x2697e6Ddbf572df3403B2451b954762Fd22002F6",

  [TESTNET_CHAINS.Mainnet]: "0x104c4e209329524adb0febE8b6481346a6eB75C6",
  [TESTNET_CHAINS.Arbitrum]: "0x88aa4FbF86392cBF6f6517790E288314DE03E181",
  [TESTNET_CHAINS.Optimism]: "0x2697e6Ddbf572df3403B2451b954762Fd22002F6",
};

export class GaugeStakingService extends SDKConstruct {
  #compressor: Address;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#compressor = GAUGE_COMPRESSORS[sdk.provider.chainId];
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
