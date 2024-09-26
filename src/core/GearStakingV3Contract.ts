import { ADDRESS_0X0 } from "@gearbox-protocol/sdk-gov";
import { Address, DecodeFunctionDataReturnType } from "viem";
import { Provider } from "../../deployer/Provider";
import { gearStakingV3Abi } from "../../generated";
import { BaseContract } from "../../sdk/base/BaseContract";
import { VotingContractStatus } from "../../sdk/base/types";
import { GearStakingV3State } from "../../sdk/state/coreState";

type abi = typeof gearStakingV3Abi;

export class GearStakingContract extends BaseContract<abi> {
  constructor(args: { address: Address; chainClient: Provider }) {
    super({ ...args, name: "GearStakingV3", abi: gearStakingV3Abi });
  }

  parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "setVotingContractStatus":
        const [address, status] = params.args;
        return [this.addressLabels.get(address), VotingContractStatus[status]];
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
