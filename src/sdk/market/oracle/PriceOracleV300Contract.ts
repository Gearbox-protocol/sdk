import type { Address, ContractEventName, Log } from "viem";

import { iPausableAbi } from "../../../abi/iPausable";
import { iPriceOracleV300Abi } from "../../../abi/v300";
import type { PriceOracleData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { tickerInfoTokensByNetwork } from "../../sdk-gov-legacy";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract";

const abi = [...iPriceOracleV300Abi, ...iPausableAbi];
type abi = typeof abi;

export class PriceOracleV300Contract extends PriceOracleBaseContract<abi> {
  constructor(sdk: GearboxSDK, data: PriceOracleData, underlying: Address) {
    super(
      sdk,
      {
        ...data.baseParams,
        name: "PriceOracleV3",
        abi,
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

  protected override findTokenForPriceFeed(
    priceFeed: Address,
  ): [token: Address | undefined, reserve: boolean] {
    const [token, reserve] = super.findTokenForPriceFeed(priceFeed);
    if (token) {
      return [token, reserve];
    }
    const tickers = Object.values(
      tickerInfoTokensByNetwork[this.sdk.provider.networkType],
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
