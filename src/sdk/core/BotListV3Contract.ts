import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";

import { iBotListV300Abi } from "../../abi/v300.js";
import { BaseContract } from "../base/index.js";
import { botPermissionsToString } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { BotListStateHuman } from "../types/index.js";

const abi = iBotListV300Abi;
type abi = typeof abi;

export class BotListContract extends BaseContract<abi> {
  #approvedCreditManagers?: Set<Address>;
  #currentBlock: bigint;

  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, { addr: address, name: "BotListV3", abi });
    this.#currentBlock = sdk.provider.chain.firstBlock ?? 0n;
  }

  protected parseFunctionParams(
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

  public async syncState(toBlock: bigint): Promise<void> {
    const logs = await this.provider.publicClient.getContractEvents({
      address: this.address,
      abi: this.abi,
      fromBlock: this.#currentBlock,
      toBlock,
    });
    logs.forEach(e => this.processLog(e));
    this.#currentBlock = toBlock;
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

  public get approvedCreditManagers(): Set<Address> {
    if (!this.#approvedCreditManagers) {
      throw new Error(
        "BotListContract state needs to be synced to load approvedCreditManagers",
      );
    }
    return this.#approvedCreditManagers;
  }

  public override stateHuman(raw = true): BotListStateHuman {
    return super.stateHuman(raw);
  }
}
