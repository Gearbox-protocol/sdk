import {
  type Address,
  type ContractEventName,
  decodeFunctionData,
  encodeFunctionData,
  type Log,
} from "viem";
import { iUpdatablePriceFeedAbi } from "../../../abi/iUpdatablePriceFeed.js";
import {
  iCreditFacadeMulticallV310Abi,
  iPriceOracleV310Abi,
} from "../../../abi/v310.js";
import type { PriceOracleData } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { MultiCall } from "../../types/index.js";
import type { UpdatePriceFeedsResult } from "../pricefeeds/index.js";
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

  /**
   * Converts previously obtained price updates into CreditFacade multicall entry
   * @param creditFacade
   * @param updates
   * @returns
   */
  public onDemandPriceUpdates(
    creditFacade: Address,
    updates?: UpdatePriceFeedsResult,
  ): MultiCall[] {
    if (!updates) {
      this.logger?.debug("empty updates list");
      return [];
    }
    return [
      {
        target: creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeMulticallV310Abi,
          functionName: "onDemandPriceUpdates",
          args: [
            updates.txs.map(u => {
              const { args } = decodeFunctionData({
                abi: iUpdatablePriceFeedAbi,
                data: u.raw.callData,
              });
              const data = args[0];
              if (!data) {
                throw new Error(
                  `failed to decode update price args for ${u.raw.description}`,
                );
              }
              return {
                priceFeed: u.raw.to,
                data,
              };
            }),
          ],
        }),
      },
    ];
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
