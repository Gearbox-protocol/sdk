import {
  type Address,
  type ContractEventName,
  decodeFunctionData,
  encodeFunctionData,
  type Log,
} from "viem";

import { iPausableAbi } from "../../../abi/iPausable.js";
import { iUpdatablePriceFeedAbi } from "../../../abi/iUpdatablePriceFeed.js";
import {
  iCreditFacadeV300MulticallAbi,
  iPriceOracleV300Abi,
} from "../../../abi/v300.js";
import type { PriceOracleData } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { tickerInfoTokensByNetwork } from "../../sdk-gov-legacy/index.js";
import type { MultiCall } from "../../types/index.js";
import type {
  PriceUpdateV300,
  UpdatePriceFeedsResult,
} from "../pricefeeds/index.js";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract.js";
import type { OnDemandPriceUpdates } from "./types.js";

const abi = [...iPriceOracleV300Abi, ...iPausableAbi];
type abi = typeof abi;

export class PriceOracleV300Contract extends PriceOracleBaseContract<abi> {
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
      case "Paused":
      case "Unpaused":
        break;
      case "SetPriceFeed":
      case "SetReservePriceFeed":
      case "SetReservePriceFeedStatus":
        this.dirty = true;
        break;
    }
  }

  /**
   * Converts previously obtained price updates into CreditFacade multicall entries
   * @param creditFacade
   * @param updates
   * @returns
   */
  public onDemandPriceUpdates(
    creditFacade: Address,
    updates?: UpdatePriceFeedsResult,
  ): OnDemandPriceUpdates<PriceUpdateV300> {
    // TODO: really here I'm doing lots of reverse processing:
    // decoding RawTx into Redstone calldata
    // and then finding token + reserve value for a price feed
    // it would be much nicer to have intermediate format and get RawTx/OnDemandPriceUpdate/ViemMulticall from it (as it's done in liquidator)
    const multicall: MultiCall[] = [];
    const raw: PriceUpdateV300[] = [];
    if (!updates) {
      this.logger?.debug("empty updates list");
      return { multicall, raw };
    }
    const { txs } = updates;

    for (const tx of txs) {
      const { to: priceFeed, callData, description } = tx.raw;
      const [token, reserve] = this.findTokenForPriceFeed(priceFeed);
      // this situation happens when we have combined updates from multiple markets,
      // but this particular feed is not added to this particular oracle
      if (!token) {
        const mains = this.mainPriceFeeds.values().map(v => v.address);
        const reserves = this.reservePriceFeeds.values().map(v => v.address);
        this.logger?.debug(
          { mainPriceFeeds: mains, reservePriceFeeds: reserves },
          `skipping onDemandPriceUpdate ${description}): token not found for price feed ${priceFeed} in oracle ${this.address}`,
        );
        continue;
      }
      const { args } = decodeFunctionData({
        abi: iUpdatablePriceFeedAbi,
        data: callData,
      });
      const data = args[0];
      if (!data) {
        throw new Error(
          `failed to decode update price args for ${description}`,
        );
      }
      raw.push({ token, reserve, data });
      multicall.push({
        target: creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeV300MulticallAbi,
          functionName: "onDemandPriceUpdate",
          args: [token, reserve, data],
        }),
      });
    }
    this.logger?.debug(
      `got ${multicall.length} onDemandPriceUpdates from ${txs.length} txs`,
    );
    return { multicall, raw };
  }

  public override findTokenForPriceFeed(
    priceFeed: Address,
  ): [token: Address | undefined, reserve: boolean] {
    const [token, reserve] = super.findTokenForPriceFeed(priceFeed);
    if (token) {
      return [token, reserve];
    }
    const tickers = Object.values(
      tickerInfoTokensByNetwork[this.sdk.networkType],
    ).flat();
    const ticker = tickers.find(
      t => t.priceFeed.toLowerCase() === priceFeed.toLowerCase(),
    );
    if (ticker) {
      this.logger?.debug(
        `will use ticker ${ticker.symbol} (${ticker.address}) for price feed ${priceFeed}`,
      );
      return [ticker.address, false];
    }
    return [undefined, false];
  }
}
