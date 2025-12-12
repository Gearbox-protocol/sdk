import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";
import { bytesToString, parseEventLogs, toBytes } from "viem";

import { iAddressProviderV310Abi } from "../../../abi/310/generated.js";
import type { ConstructOptions } from "../../base/Construct.js";
import AbstractAddressProviderContract from "./AbstractAddressProviderContract.js";
import type { IAddressProviderContract } from "./types.js";

const abi = iAddressProviderV310Abi;
type abi = typeof abi;

export class AddressProviderV310Contract
  extends AbstractAddressProviderContract<abi>
  implements IAddressProviderContract
{
  constructor(
    options: ConstructOptions,
    address: Address,
    version: number = 310,
    addresses: Record<string, Record<number, Address>> = {},
  ) {
    super(
      options,
      {
        addr: address,
        name: "AddressProviderV310",
        abi,
        version,
      },
      addresses,
    );
  }

  protected override stringifyFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): string[] {
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
        return super.stringifyFunctionParams(params);
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
        const { key, ver, value } = args;

        this.setInternalAddress(key, value, Number(ver));
        break;
      }
      default:
        this.logger?.warn(`Unknown event: ${log.eventName}`);
        break;
    }
  }

  public async syncState(blockNumber?: bigint): Promise<void> {
    const entries = await this.contract.read.getAllEntries({
      blockNumber,
    });
    this.logger?.debug(
      `loaded ${entries.length} events in block ${blockNumber}`,
    );
    for (const { key, ver, value } of entries) {
      this.setInternalAddress(key, value, Number(ver));
    }
  }
}
