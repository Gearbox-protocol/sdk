import type { Address, DecodeFunctionDataReturnType } from "viem";

import { gearStakingV3Abi } from "../abi";
import { BaseContract, VotingContractStatus } from "../base";
import { ADDRESS_0X0 } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { GearStakingV3StateHuman } from "../types";

type abi = typeof gearStakingV3Abi;

export class GearStakingContract extends BaseContract<abi> {
  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, { addr: address, name: "GearStakingV3", abi: gearStakingV3Abi });
  }

  parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "setVotingContractStatus": {
        const [address, status] = params.args;
        return [this.addressLabels.get(address), VotingContractStatus[status]];
      }
      default:
        return undefined;
    }
  }

  public override stateHuman(raw = true): GearStakingV3StateHuman {
    return {
      ...super.stateHuman(raw),
      successor: this.labelAddress(ADDRESS_0X0),
      migrator: this.labelAddress(ADDRESS_0X0),
    };
  }
}
