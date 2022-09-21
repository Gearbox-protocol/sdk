import { BigNumber, providers } from "ethers";

import { SupportedContract } from "../contracts/contracts";
import { MultiCall } from "../pathfinder/core";
import { SupportedToken } from "../tokens/token";
import { NetworkType } from "./constants";
import { CreditAccountData } from "./creditAccount";
import { CreditManagerData } from "./creditManager";
import { RewardConvex } from "./rewardConvex";

export interface Rewards {
  contract: SupportedContract;
  rewards: Partial<Record<SupportedToken, BigNumber>>;
  calls: Array<MultiCall>;
}

export interface AdapterWithType {
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
