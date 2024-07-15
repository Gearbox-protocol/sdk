import {
  NetworkType,
  PartialRecord,
  Protocols,
  SupportedContract,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";
import { Address, PublicClient } from "viem";

import { MultiCall } from "../pathfinder/core";
import { CreditAccountData } from "./creditAccount";
import { CreditManagerData } from "./creditManager";
import { RewardConvex } from "./rewardConvex";

export interface Rewards {
  contract: SupportedContract;
  totalSupply: bigint;
  protocol: Protocols.Aura | Protocols.Convex;

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
    return RewardConvex.findRewards(ca, cm, network, provider);
  }
}
