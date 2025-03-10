import {
  type Address,
  type ContractEventName,
  type Log,
  stringToHex,
} from "viem";

import { iMarketConfiguratorV310Abi } from "../../abi/v310.js";
import { BaseContract } from "../base/index.js";
import type { PeripheryContract } from "../constants/index.js";
import { AP_MARKET_CONFIGURATOR } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";

const abi = iMarketConfiguratorV310Abi;
type abi = typeof abi;

export class MarketConfiguratorContract extends BaseContract<abi> {
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

  public async getPeripheryContract(
    contract: PeripheryContract,
  ): Promise<Address> {
    const resp = await this.sdk.provider.publicClient.readContract({
      address: this.address,
      abi: this.abi,
      functionName: "getPeripheryContracts",
      args: [stringToHex(contract, { size: 32 })],
    });
    if (resp.length === 0) {
      throw new Error(`periphery contract ${contract} not found`);
    }
    return resp[0];
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
