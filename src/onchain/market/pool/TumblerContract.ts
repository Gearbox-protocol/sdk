import type { ContractEventName, Log } from "viem";
import { decodeAbiParameters } from "viem";

import { iTumblerV310Abi } from "../../../abi/310/generated.js";
import type {
  ConstructOptions,
  PoolState,
  RateKeeperState,
} from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { TumblerStateHuman } from "../../types/index.js";
import { AddressMap, formatDuration, percentFmt } from "../../utils/index.js";
import type { IRateKeeperContract } from "./types.js";

const abi = iTumblerV310Abi;
type abi = typeof abi;

export class TumblerContract
  extends BaseContract<abi>
  implements IRateKeeperContract
{
  public readonly epochLength: bigint;
  public readonly rates: AddressMap<number>;

  constructor(
    options: ConstructOptions,
    pool: PoolState,
    tumbler: RateKeeperState,
  ) {
    super(options, {
      ...tumbler.baseParams,
      name: `Tumbler(${pool.name})`,
      abi,
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
