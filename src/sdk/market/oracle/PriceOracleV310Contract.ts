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
import type { OnchainSDK } from "../../OnchainSDK.js";
import { simulateWithPriceUpdates } from "../../utils/viem/simulateWithPriceUpdates.js";
import {
  getRawPriceUpdates,
  type UpdatePriceFeedsResult,
} from "../pricefeeds/index.js";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract.js";
import type { OnDemandPriceUpdates } from "./types.js";

const abi = iPriceOracleV310Abi;
type abi = typeof abi;

export class PriceOracleV310Contract extends PriceOracleBaseContract<abi> {
  constructor(sdk: OnchainSDK, data: PriceOracleData) {
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
  ): OnDemandPriceUpdates {
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

  /**
   * {@inheritDoc IPriceOracleContract.updateAndConvert}
   **/
  public async updateAndConvert(
    from: Address,
    to: Address,
    amount: bigint,
  ): Promise<bigint> {
    const fromFeed = this.mainPriceFeeds.mustGet(from).priceFeed;
    const toFeed = this.mainPriceFeeds.mustGet(to).priceFeed;
    const updates = await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs([
      fromFeed,
      toFeed,
    ]);
    const [result] = await simulateWithPriceUpdates(this.sdk.client, {
      priceUpdates: updates.txs,
      contracts: [
        {
          abi: this.contract.abi,
          functionName: "convert",
          args: [amount, from, to],
          address: this.contract.address,
        },
      ],
      strictPrices: true,
      gas: this.sdk.gasLimit,
    });
    return result;
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
