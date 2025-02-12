import type { ContractEventName, Log } from "viem";
import { decodeAbiParameters } from "viem";

import { iTumblerV3Abi } from "../../abi";
import type { PoolData, RateKeeperData } from "../../base";
import { BaseContract } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { TumblerStateHuman } from "../../types";
import { AddressMap, formatDuration, percentFmt } from "../../utils";
import type { IRateKeeperContract } from "./types";

type abi = typeof iTumblerV3Abi;

export class TumblerContract
  extends BaseContract<abi>
  implements IRateKeeperContract
{
  public readonly epochLength: bigint;
  public readonly rates: AddressMap<number>;

  constructor(sdk: GearboxSDK, pool: PoolData, tumbler: RateKeeperData) {
    super(sdk, {
      ...tumbler.baseParams,
      name: `Tumbler(${pool.name})`,
      abi: iTumblerV3Abi,
    });

    const [epochLength, tokens_, rates_] = decodeAbiParameters(
      [
        { name: "epochLength", type: "uint256" },
        { name: "tokens", type: "address[]" },
        { name: "rates", type: "uint16[]" },
      ],
      tumbler.baseParams.serializedParams,
    );
    this.epochLength = epochLength;
    this.rates = new AddressMap(tokens_.map((t, i) => [t, rates_[i]]));
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
      case "AddToken":
      case "SetRate":
        this.dirty = true;
        break;
    }
  }

  public override stateHuman(raw?: boolean): TumblerStateHuman {
    return {
      ...super.stateHuman(raw),
      epochLength: formatDuration(Number(this.epochLength), raw),
      rates: this.rates.entries().reduce(
        (acc, [token, rate]) => ({
          ...acc,
          [this.labelAddress(token)]: percentFmt(rate, raw),
        }),
        {},
      ),
    };
  }
}
