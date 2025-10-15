import {
  type Address,
  type ContractEventName,
  encodeFunctionData,
  type Log,
} from "viem";
import {
  iCreditFacadeMulticallV310Abi,
  iPriceOracleV310Abi,
} from "../../../abi/310/generated.js";
import type { PriceOracleData } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import {
  getRawPriceUpdates,
  type PriceUpdateV310,
  type UpdatePriceFeedsResult,
} from "../pricefeeds/index.js";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract.js";
import type { OnDemandPriceUpdates } from "./types.js";

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

  /**
   * Converts previously obtained price updates into CreditFacade multicall entry
   * @param creditFacade
   * @param updates
   * @returns
   */
  public onDemandPriceUpdates(
    creditFacade: Address,
    updates?: UpdatePriceFeedsResult,
  ): OnDemandPriceUpdates<PriceUpdateV310> {
    if (!updates) {
      this.logger?.debug("empty updates list");
      return { multicall: [], raw: [] };
    }
    const raw = getRawPriceUpdates(updates);
    return {
      raw,
      multicall: [
        {
          target: creditFacade,
          callData: encodeFunctionData({
            abi: iCreditFacadeMulticallV310Abi,
            functionName: "onDemandPriceUpdates",
            args: [raw],
          }),
        },
      ],
    };
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
