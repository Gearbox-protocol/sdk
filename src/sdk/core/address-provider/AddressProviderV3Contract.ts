import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";
import { bytesToString, getAbiItem, parseEventLogs, toBytes } from "viem";

import { iAddressProviderV3Abi } from "../../abi";
import { ADDRESS_PROVIDER_BLOCK } from "../../constants";
import type { GearboxSDK } from "../../GearboxSDK";
import AbstractAddressProviderContract from "./AbstractAddressProviderContract";
import type { IAddressProviderContract } from "./types";

const abi = iAddressProviderV3Abi;
type abi = typeof abi;

export class AddressProviderContractV3
  extends AbstractAddressProviderContract<abi>
  implements IAddressProviderContract
{
  constructor(
    sdk: GearboxSDK,
    address: Address,
    addresses: Record<string, Record<number, Address>> = {},
  ) {
    super(
      sdk,
      {
        addr: address,
        name: "AddressProviderV3",
        abi,
        version: 3_00,
      },
      addresses,
    );
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
    const events = await this.sdk.provider.publicClient.getLogs({
      address: this.address,
      event: getAbiItem({ abi: this.abi, name: "SetAddress" }),
      fromBlock: ADDRESS_PROVIDER_BLOCK[this.sdk.provider.networkType],
      toBlock: blockNumber,
      strict: true,
    });
    for (const event of events) {
      this.setInternalAddress(
        event.args.key,
        event.args.value,
        Number(event.args.version),
      );
    }
  }
}
