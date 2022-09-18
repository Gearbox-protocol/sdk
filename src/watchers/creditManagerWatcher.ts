import { providers, Signer } from "ethers";

import { CreditManagerData } from "../core/creditManager";
import { CreditManagerDataPayload } from "../payload/creditManager";
import {
  ICreditConfigurator__factory,
  ICreditManagerV2__factory,
  IDataCompressor__factory,
} from "../types";

export class CreditManagerWatcher {
  static creditManagerInterface = ICreditManagerV2__factory.createInterface();
  static creditConfiguratorInterface =
    ICreditConfigurator__factory.createInterface();

  static async getV2CreditManagers(
    dataCompressor: string,
    signer: Signer | providers.Provider,
    atBlock?: number,
  ): Promise<Record<string, CreditManagerData>> {
    const creditManagers: Record<string, CreditManagerData> = {};

    const creditManagersPayload: Array<CreditManagerDataPayload> =
      await IDataCompressor__factory.connect(
        dataCompressor,
        signer,
      ).getCreditManagersList({ blockTag: atBlock });

    creditManagersPayload
      .filter(c => c.version === 2)
      .forEach(c => {
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
        const { name } =
          CreditManagerWatcher.creditManagerInterface.parseLog(log);

        if (name === "NewConfigurator") {
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
