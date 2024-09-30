import { botPermissionsToString } from "@gearbox-protocol/sdk-gov";
import type { Address, DecodeFunctionDataReturnType, Log } from "viem";
import { parseEventLogs } from "viem";

import { botListV3Abi } from "../abi";
import { BaseContract } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { BotListState } from "../state";

type abi = typeof botListV3Abi;

export class BotListContract extends BaseContract<abi> {
  approvedCreditManagers: Set<Address> = new Set();

  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, { address, name: "BotListV3", abi: botListV3Abi });
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "setCreditManagerApprovedStatus": {
        const [creditManager, status] = params.args;
        return [this.addressLabels.get(creditManager), `${status}`];
      }
      case "setBotSpecialPermissions": {
        const [bot, creditManager, permissions] = params.args;
        return [
          this.addressLabels.get(bot),
          this.addressLabels.get(creditManager),
          botPermissionsToString(permissions),
        ];
      }
      default:
        return undefined;
    }
  }

  public async fetchState(toBlock: bigint) {
    const logs = await this.provider.publicClient.getContractEvents({
      address: this.address,
      abi: this.abi,
      fromBlock: 0n,
      toBlock,
    });

    logs.forEach(e => this.parseLog(e));
  }

  public override parseLog(log: Log): void {
    const parsedLog = parseEventLogs({
      abi: this.abi,
      logs: [log],
    })[0];

    switch (parsedLog.eventName) {
      case "SetCreditManagerApprovedStatus":
        if (parsedLog.args.approved) {
          this.approvedCreditManagers.add(parsedLog.args.creditManager);
        } else {
          this.approvedCreditManagers.delete(parsedLog.args.creditManager);
        }
        break;

      case "SetBotSpecialPermissions":
        this.logger?.debug(
          `Bot ${parsedLog.args.bot} has been given permissions ${botPermissionsToString(
            parsedLog.args.permissions,
          )} for credit manager ${parsedLog.args.creditManager}`,
        );
        break;
      default:
        this.logger?.warn(`Unknown event: ${parsedLog.eventName}`);
        break;
    }
  }

  public get state(): BotListState {
    return {
      ...this.contractData,
    };
  }
}
