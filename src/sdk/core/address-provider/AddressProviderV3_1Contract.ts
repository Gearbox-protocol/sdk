import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";
import { bytesToString, parseEventLogs, toBytes } from "viem";

import { iAddressProviderV3_1Abi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import AbstractAddressProviderContract from "./AbstractAddressProviderContract";
import type { IAddressProviderContract } from "./types";

const abi = iAddressProviderV3_1Abi;
type abi = typeof abi;

export class AddressProviderContractV3_1
  extends AbstractAddressProviderContract<abi>
  implements IAddressProviderContract
{
  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "AddressProviderV3_1",
      abi,
    });
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "setAddress": {
        if (params.args.length !== 3) {
          const [key, saveVersion] = params.args;
          return [key, `${saveVersion}`];
        }
        const [key, value, saveVersion] = params.args;
        return [bytesToString(toBytes(key)), value, `${saveVersion}`];
      }
      default:
        return undefined;
    }
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
      case "SetAddress": {
        const { args } = parseEventLogs({
          abi: this.abi,
          eventName: "SetAddress",
          logs: [log],
        })[0];
        const { key, version } = args;

        this.setInternalAddress(
          key,
          log.args.value as Address,
          Number(version),
        );
        break;
      }
      default:
        this.logger?.warn(`Unknown event: ${log.eventName}`);
        break;
    }
  }

  public async syncState(blockNumber?: bigint): Promise<void> {
    const entries = await this.contract.read.getAllSavedContracts({
      blockNumber,
    });
    for (const log of entries) {
      this.setInternalAddress(log.key, log.value, Number(log.version));
    }
  }
}
