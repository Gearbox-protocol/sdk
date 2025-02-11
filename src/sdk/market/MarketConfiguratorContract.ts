import type { Address, ContractEventName, Log } from "viem";

import { iMarketConfiguratorV310Abi } from "../abi";
import { BaseContract } from "../base";
import { AP_MARKET_CONFIGURATOR } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";

const abi = iMarketConfiguratorV310Abi;

export class MarketConfiguratorContract extends BaseContract<typeof abi> {
  #curatorName?: string;

  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, {
      abi,
      addr: address,
      contractType: AP_MARKET_CONFIGURATOR,
      version: 0,
    });
  }

  public async loadCuratorName(): Promise<void> {
    this.#curatorName = await this.sdk.provider.publicClient.readContract({
      address: this.address,
      abi: this.abi,
      functionName: "curatorName",
    });
    this.sdk.provider.addressLabels.set(
      this.address,
      "Market configurator " + this.#curatorName,
    );
  }

  public override processLog(
    log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      typeof abi,
      ContractEventName<typeof abi>
    >,
  ): void {
    switch (log.eventName) {
      // case "DeployDegenNFT":
      // case "SetName":
      // case "SetPriceFeedFromStore":
      // case "SetReservePriceFeedFromStore":
      case "ShutdownMarket":
      case "CreateMarket":
        this.dirty = true;
        break;
    }
  }
}
