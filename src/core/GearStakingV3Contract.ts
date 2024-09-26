import type { Address, DecodeFunctionDataReturnType } from "viem";

import { gearStakingV3Abi } from "../abi";
import { BaseContract, VotingContractStatus } from "../base";
import { ADDRESS_0X0 } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { GearStakingV3State } from "../state";

type abi = typeof gearStakingV3Abi;

export class GearStakingContract extends BaseContract<abi> {
  constructor(args: { address: Address; sdk: GearboxSDK }) {
    super({ ...args, name: "GearStakingV3", abi: gearStakingV3Abi });
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

  public get state(): GearStakingV3State {
    return {
      ...this.contractData,
      successor: ADDRESS_0X0,
      migrator: ADDRESS_0X0,
    };
  }
}
