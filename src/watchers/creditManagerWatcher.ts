import { formatBytes32String, providers, Signer } from "ethers";

import { CreditManagerData } from "../core/creditManager";
import {
  IAddressProviderV3__factory,
  ICreditManagerV2__factory,
  ICreditManagerV3__factory,
  IDataCompressorV2_1__factory,
  IDataCompressorV3__factory,
} from "../types";

export class CreditManagerWatcher {
  private static newConfiguratorV2Topic =
    ICreditManagerV2__factory.createInterface().getEventTopic(
      "NewConfigurator",
    );
  private static newConfiguratorV3Topic =
    ICreditManagerV3__factory.createInterface().getEventTopic(
      "SetCreditConfigurator",
    );

  static async getAllCreditManagers(
    addressProvider: string,
    signer: Signer | providers.Provider,
    atBlock?: number,
  ): Promise<Record<string, CreditManagerData>> {
    const ap = IAddressProviderV3__factory.connect(addressProvider, signer);
    const [dc210, dc300] = await Promise.all([
      ap.getAddressOrRevert(formatBytes32String("DATA_COMPRESSOR"), 210, {
        blockTag: atBlock,
      }),
      ap.getAddressOrRevert(formatBytes32String("DATA_COMPRESSOR"), 300, {
        blockTag: atBlock,
      }),
    ]);
    const [cms2, cms3] = await Promise.all([
      CreditManagerWatcher.getV2CreditManagers(dc210, signer, atBlock),
      CreditManagerWatcher.getV3CreditManagers(dc300, signer, atBlock),
    ]);
    return { ...cms2, ...cms3 };
  }

  static async getV2CreditManagers(
    dataCompressorV210: string,
    signer: Signer | providers.Provider,
    atBlock?: number,
  ): Promise<Record<string, CreditManagerData>> {
    const creditManagers: Record<string, CreditManagerData> = {};

    const creditManagersPayload = await IDataCompressorV2_1__factory.connect(
      dataCompressorV210,
      signer,
    ).getCreditManagersV2List({ blockTag: atBlock });

    creditManagersPayload.forEach(c => {
      creditManagers[c.addr.toLowerCase()] = new CreditManagerData(c);
    });

    return creditManagers;
  }

  static async getV3CreditManagers(
    dataCompressorV300: string,
    signer: Signer | providers.Provider,
    atBlock?: number,
  ): Promise<Record<string, CreditManagerData>> {
    const creditManagers: Record<string, CreditManagerData> = {};

    const creditManagersPayload = await IDataCompressorV3__factory.connect(
      dataCompressorV300,
      signer,
    ).getCreditManagersV3List({ blockTag: atBlock });

    creditManagersPayload.forEach(c => {
      creditManagers[c.addr.toLowerCase()] = new CreditManagerData(c);
    });

    return creditManagers;
  }

  static detectConfigChanges(
    freshLogs: Array<providers.Log>,
    creditManagers: Array<CreditManagerData>,
  ): boolean {
    const cms = creditManagers.map(c => c.address);
    const ccs = creditManagers.map(c => c.creditConfigurator);

    for (let log of freshLogs) {
      if (cms.includes(log.address.toLowerCase())) {
        if (
          log.topics[0] === CreditManagerWatcher.newConfiguratorV2Topic ||
          log.topics[0] === CreditManagerWatcher.newConfiguratorV3Topic
        ) {
          return true;
        }
      }

      if (ccs.includes(log.address.toLowerCase())) {
        return true;
      }
    }
    return false;
  }
}
