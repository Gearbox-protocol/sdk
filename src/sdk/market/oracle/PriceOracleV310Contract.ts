import type { Address, ContractEventName, Log } from "viem";

import { iPriceOracleV310Abi } from "../../abi";
import type { PriceOracleData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract";

type abi = typeof iPriceOracleV310Abi;

export class PriceOracleV310Contract extends PriceOracleBaseContract<abi> {
  constructor(sdk: GearboxSDK, data: PriceOracleData, underlying: Address) {
    super(
      sdk,
      {
        ...data.baseParams,
        name: "PriceOracleV3",
        abi: iPriceOracleV310Abi,
      },
      data,
      underlying,
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
      case "AddUpdatablePriceFeed":
      case "NewController":
      case "SetPriceFeed":
      case "SetReservePriceFeed":
        this.dirty = true;
        break;
    }
  }
}
