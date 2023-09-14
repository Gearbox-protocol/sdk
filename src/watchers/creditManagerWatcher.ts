import { toBigInt } from "@gearbox-protocol/sdk-gov";
import { providers, Signer } from "ethers";

import { CreditManagerData } from "../core/creditManager";
import {
  ICreditConfigurator__factory,
  ICreditManagerV2__factory,
} from "../types";
import { IDataCompressorV2_10__factory } from "../types-v3";

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

    const creditManagersPayload = await IDataCompressorV2_10__factory.connect(
      dataCompressor,
      signer,
    ).getCreditManagersV2List({ blockTag: atBlock });

    creditManagersPayload
      .filter(
        c => toBigInt(c.cfVersion) === 2n || toBigInt(c.cfVersion) === 210n,
      )
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
