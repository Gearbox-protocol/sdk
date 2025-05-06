import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";
import { bytesToString, getAbiItem, parseEventLogs, toBytes } from "viem";

import { iAddressProviderV300Abi } from "../../../abi/v300.js";
import { ADDRESS_PROVIDER_BLOCK } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { getLogsSafe } from "../../utils/viem/index.js";
import AbstractAddressProviderContract from "./AbstractAddressProviderContract.js";
import type { IAddressProviderContract } from "./types.js";

const abi = iAddressProviderV300Abi;
type abi = typeof abi;

export class AddressProviderV300Contract
  extends AbstractAddressProviderContract<abi>
  implements IAddressProviderContract
{
  constructor(
    sdk: GearboxSDK,
    address: Address,
    version: number,
    addresses: Record<string, Record<number, Address>> = {},
  ) {
    super(
      sdk,
      {
        addr: address,
        name: "AddressProviderV300",
        abi,
        version,
      },
      addresses,
    );
  }

  protected parseFunctionParams(
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
    const fromBlock = ADDRESS_PROVIDER_BLOCK[this.sdk.provider.networkType];
    this.logger?.debug(
      `loading events from block ${fromBlock} to ${blockNumber}`,
    );
    const events = await getLogsSafe(this.sdk.provider.publicClient, {
      address: this.address,
      event: getAbiItem({ abi: this.abi, name: "SetAddress" }),
      fromBlock,
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
