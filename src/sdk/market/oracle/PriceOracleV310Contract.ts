import type { ContractEventName, Log } from "viem";

import { iPriceOracleV310Abi } from "../../../abi/v310.js";
import type { PriceOracleData } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract.js";

const abi = iPriceOracleV310Abi;
type abi = typeof abi;

export class PriceOracleV310Contract extends PriceOracleBaseContract<abi> {
  constructor(sdk: GearboxSDK, data: PriceOracleData) {
    super(
      sdk,
      {
        ...data.baseParams,
        name: "PriceOracleV3",
        abi,
      },
      data,
    );
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
      case "SetPriceFeed":
      case "SetReservePriceFeed":
        this.dirty = true;
        break;
    }
  }
}
