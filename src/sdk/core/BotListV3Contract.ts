import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";

import { botListV3Abi } from "../abi";
import { BaseContract } from "../base";
import { botPermissionsToString } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { BotListStateHuman } from "../types";

type abi = typeof botListV3Abi;

export class BotListContract extends BaseContract<abi> {
  approvedCreditManagers: Set<Address> = new Set();

  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, { addr: address, name: "BotListV3", abi: botListV3Abi });
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

  public async fetchState(toBlock: bigint): Promise<void> {
    const logs = await this.provider.publicClient.getContractEvents({
      address: this.address,
      abi: this.abi,
      fromBlock: 0n,
      toBlock,
    });

    logs.forEach(e => this.processLog(e));
  }

  public override processLog(
    log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      abi,
      ContractEventName<abi>
    >,
  ): void {
    switch (log.eventName) {
      case "SetCreditManagerApprovedStatus":
        if (log.args.approved) {
          this.approvedCreditManagers.add(log.args.creditManager!);
        } else {
          this.approvedCreditManagers.delete(log.args.creditManager!);
        }
        break;

      case "SetBotSpecialPermissions":
        this.logger?.debug(
          `Bot ${log.args.bot} has been given permissions ${botPermissionsToString(
            log.args.permissions!,
          )} for credit manager ${log.args.creditManager}`,
        );
        break;
      default:
        this.logger?.warn(`Unknown event: ${log.eventName}`);
        break;
    }
  }

  public override stateHuman(raw = true): BotListStateHuman {
    return super.stateHuman(raw);
  }
}
