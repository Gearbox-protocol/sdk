import {
  NetworkType,
  SupportedContract,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";
import { providers } from "ethers";

import { MultiCall } from "../pathfinder/core";
import { CreditAccountData } from "./creditAccount";
import { CreditManagerData } from "./creditManager";
import { RewardConvex } from "./rewardConvex";

export interface Rewards {
  contract: SupportedContract;
  rewards: Partial<Record<SupportedToken, bigint>>;
  calls: Array<MultiCall>;
}

export interface AdapterWithType {
  contractAddress: string;
  adapter: string;
  contract: SupportedContract;
}

export class RewardClaimer {
  static async findRewards(
    ca: CreditAccountData,
    cm: CreditManagerData,
    network: NetworkType,
    provider: providers.Provider,
  ): Promise<Array<Rewards>> {
    return RewardConvex.findRewards(ca, cm, network, provider);
  }
}
