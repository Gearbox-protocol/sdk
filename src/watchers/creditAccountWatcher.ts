import { providers, Signer } from "ethers";

import { CreditAccountData } from "../core/creditAccount";
import { CreditManagerData } from "../core/creditManager";
import { CreditAccountDataPayload } from "../payload/creditAccount";
import {
  ICreditConfigurator__factory,
  ICreditFacade__factory,
  ICreditManagerV2__factory,
  IDataCompressor__factory,
  IERC20__factory,
} from "../types";
import { IDataCompressorInterface } from "../types/@gearbox-protocol/core-v2/contracts/interfaces/IDataCompressor.sol/IDataCompressor";
import { TypedEvent } from "../types/common";
import { CallData, MultiCallContract } from "../utils/multicall";

interface CMEvent {
  time: number;
  address: string;
  operation: "add" | "delete";
}

export type CreditAccountHash = string;

export interface CreditManagerUpdate {
  /// Modified or created
  updated: Array<CreditAccountHash>;
  deleted: Array<CreditAccountHash>;
}

interface CreditManagerUpdateInt {
  updated: Set<string>;
  deleted: Set<string>;
}

interface BatchCreditAccountLoadOptions {
  atBlock?: number;
  chunkSize?: number;
}

export class CreditAccountWatcher {
  static IERC20 = IERC20__factory.createInterface();

  static creditManagerInterface = ICreditManagerV2__factory.createInterface();
  static creditConfiguratorInterface =
    ICreditConfigurator__factory.createInterface();
  static creditFacadeInterface = ICreditFacade__factory.createInterface();

  /**
   * Gets hashes of all opened credit accounts at toBlock (or "latest" by default)
   * @param creditManager CreditManagerData of desired CreditManager to check
   * @param provider Ethers provider or signer to get an access
   * @param toBlock Optional. Set the last block you;d like to get opened accounts
   * @returns Arrays of hashes for opened accounts
   */
  static async getOpenAccounts(
    creditManager: CreditManagerData,
    provider: providers.Provider,
    toBlock?: number,
  ): Promise<Array<CreditAccountHash>> {
    if (creditManager.version !== 2) throw new Error("Works for V2 only");

    const eventsByDate: Array<CMEvent> = [];

    const addToEvents = (
      e: TypedEvent,
      address: string,
      operation: "add" | "delete",
    ) => {
      eventsByDate.push({
        time: e.blockNumber * 100000 + e.logIndex,
        address,
        operation,
      });
    };

    const accounts: Set<string> = new Set<string>();

    const cm = ICreditManagerV2__factory.connect(
      creditManager.address,
      provider,
    );
    // get all historical creditConfigurators for this cm
    const ccAddrs = (
      await cm.queryFilter(cm.filters.NewConfigurator(), undefined, toBlock)
    ).map(e => e.args.newConfigurator);

    // get all historical creditFacades for this cm
    const cfUpgraded = (
      await Promise.all(
        ccAddrs.map(async (ccAddr): Promise<string[]> => {
          const cc = ICreditConfigurator__factory.connect(ccAddr, provider);
          const cfUpgradedEvents = await cc.queryFilter(
            cc.filters.CreditFacadeUpgraded(),
            undefined,
            toBlock,
          );
          return cfUpgradedEvents.map(e => e.args.newCreditFacade);
        }),
      )
    ).flat();

    for (const creditFacade of cfUpgraded) {
      const cf = ICreditFacade__factory.connect(creditFacade, provider);

      const topics = {
        OpenCreditAccount: cf.interface.getEventTopic("OpenCreditAccount"),
        CloseCreditAccount: cf.interface.getEventTopic("CloseCreditAccount"),
        LiquidateCreditAccount: cf.interface.getEventTopic(
          "LiquidateCreditAccount",
        ),
        LiquidateExpiredCreditAccount: cf.interface.getEventTopic(
          "LiquidateExpiredCreditAccount",
        ),
        TransferAccount: cf.interface.getEventTopic("TransferAccount"),
      };

      const logs = await cf.queryFilter(
        {
          address: cf.address,
          topics: [Object.values(topics)],
        },
        undefined,
        toBlock,
      );

      logs.forEach(log => {
        const e = cf.interface.parseLog(log);
        switch (log.topics[0]) {
          case topics.OpenCreditAccount:
            addToEvents(log, e.args.onBehalfOf, "add");
            break;
          case topics.CloseCreditAccount:
          case topics.LiquidateCreditAccount:
          case topics.LiquidateExpiredCreditAccount:
            addToEvents(log, e.args.borrower, "delete");
            break;
          case topics.TransferAccount:
            addToEvents(log, e.args.oldOwner, "delete");
            addToEvents(log, log.args.newOwner, "add");
            break;
        }
      });
    }

    eventsByDate
      .sort((a, b) => {
        return a.time > b.time ? 1 : -1;
      })
      .forEach(e => {
        if (e.operation === "add") {
          accounts.add(e.address);
        } else {
          accounts.delete(e.address);
        }
      });

    return Array.from(accounts.values()).map(borrower =>
      CreditAccountData.hash(creditManager.address, borrower),
    );
  }

  static async batchCreditAccountLoad(
    accs: Array<CreditAccountHash>,
    dataCompressor: string,
    signer: Signer | providers.Provider,
    options?: BatchCreditAccountLoadOptions | number,
  ): Promise<Array<CreditAccountData>> {
    let chunkSize = 1000;
    let atBlock: number | undefined;
    if (typeof options === "object") {
      atBlock = options.atBlock;
      chunkSize = options.chunkSize ?? 1000;
    } else {
      atBlock = options;
    }

    const dcmc = new MultiCallContract(
      dataCompressor,
      IDataCompressor__factory.createInterface(),
      signer,
    );

    const calls: Array<Array<CallData<IDataCompressorInterface>>> = [];

    for (let i = 0; i < accs.length; i++) {
      const chunk = accs.slice(i * chunkSize, (i + 1) * chunkSize);
      calls[i] = chunk.map(c => {
        return {
          method: "getCreditAccountData(address,address)",
          params: c.split(":"),
        };
      });
    }

    const data: Array<Array<CreditAccountDataPayload>> = [];

    for (let c of calls) {
      const result = await dcmc.call(c, { blockTag: atBlock, gasLimit: 300e6 });
      data.push(result);
    }

    return data.flat().map(c => new CreditAccountData(c));
  }

  /**
   * Tracks block logs and detects whichj acccounts were changed (created / modified) and which were deleted
   * @param logs Logs from last N blocks
   * @param creditManagers Array of CreditManager data which account it should track
   * @returns CreditManagerUpdate which contains updated (created / modified) and deleted accounts
   */

  static detectChanges(
    logs: Array<providers.Log>,
    creditManagers: Array<CreditManagerData>,
  ): CreditManagerUpdate {
    const cms = creditManagers.map(c => c.address.toLowerCase());
    const cfToCm: Record<string, string> = {};
    const ccToCm: Record<string, string> = {};

    // maps credit manager addr to credit configurator addresses
    const trackers: Record<string, CreditManagerUpdateInt> = {};
    creditManagers.forEach(cm => {
      trackers[cm.address.toLowerCase()] = {
        updated: new Set<string>(),
        deleted: new Set<string>(),
      };
      ccToCm[cm.creditConfigurator.toLowerCase()] = cm.address.toLowerCase();
      cfToCm[cm.creditFacade.toLowerCase()] = cm.address.toLowerCase();
    });

    for (let log of logs) {
      const logAddr = log.address.toLowerCase();

      if (cms.includes(logAddr)) {
        const { name, args } =
          CreditAccountWatcher.creditManagerInterface.parseLog(log);

        if (name === "ExecuteOrder") {
          const { borrower } = args;
          if (!borrower) throw new Error(`Cant parser event ${log}`);

          /// Excludes credit facade which represents borrower in multicall
          if (!(borrower.toLowerCase() in cfToCm)) {
            trackers[logAddr].updated.add(borrower);
          }
        } else if (name === "NewConfigurator") {
          const newConfigurator = args.newConfigurator.toLowerCase();
          ccToCm[newConfigurator] = logAddr;
        }
      } else if (logAddr in ccToCm) {
        const { name, args } =
          CreditAccountWatcher.creditConfiguratorInterface.parseLog(log);
        if (name === "CreditFacadeUpgraded") {
          const newCreditFacade = args.newCreditFacade.toLowerCase();
          cfToCm[newCreditFacade] = ccToCm[logAddr];
        }
      } else if (logAddr in cfToCm) {
        const { name, args } =
          CreditAccountWatcher.creditFacadeInterface.parseLog(log);

        switch (name) {
          case "OpenCreditAccount":
          case "AddCollateral": {
            const { onBehalfOf } = args;
            if (!onBehalfOf) throw new Error(`Cant parser event ${log}`);
            trackers[cfToCm[logAddr]].updated.add(onBehalfOf);
            break;
          }

          case "DecreaseBorrowedAmount":
          case "IncreaseBorrowedAmount":
          case "TokenDisabled":
          case "TokenEnabled":
          case "MultiCallStarted": {
            const { borrower } = args;
            if (!borrower) throw new Error(`Cant parser event ${log}`);
            trackers[cfToCm[logAddr]].updated.add(borrower);
            break;
          }

          case "CloseCreditAccount":
          case "LiquidateCreditAccount":
          case "LiquidateExpiredCreditAccount": {
            const { borrower } = args;
            if (!borrower) throw new Error(`Cant parser event ${log}`);
            trackers[cfToCm[logAddr]].updated.delete(borrower);
            trackers[cfToCm[logAddr]].deleted.add(borrower);
            break;
          }

          case "TransferAccount": {
            const { oldOwner, newOwner } = args;
            if (!oldOwner || !newOwner)
              throw new Error(`Cant parser event ${log}`);
            trackers[cfToCm[logAddr]].updated.delete(oldOwner);
            trackers[cfToCm[logAddr]].updated.add(newOwner);
            trackers[cfToCm[logAddr]].deleted.add(oldOwner);
          }
        }
      }
    }

    const result: CreditManagerUpdate = {
      updated: [],
      deleted: [],
    };

    cms.forEach(cm => {
      trackers[cm].updated.forEach(borrower => {
        result.updated.push(CreditAccountData.hash(cm, borrower));
      });

      trackers[cm].deleted.forEach(borrower => {
        result.deleted.push(CreditAccountData.hash(cm, borrower));
      });
    });

    return result;
  }

  static trackDirectTransfers(
    freshLogs: Array<providers.Log>,
    tokensToTrack: Array<string>,
    accounts: Array<CreditAccountData>,
  ): Array<CreditAccountHash> {
    const tkns = tokensToTrack.map(t => t.toLowerCase());

    const accAddresses: Array<string> = [];
    const accToCa: Record<string, CreditAccountData> = {};

    const modified: Set<string> = new Set<string>();

    accounts.forEach(ca => {
      accAddresses.push(ca.addr);
      accToCa[ca.addr] = ca;
    });

    for (let log of freshLogs) {
      if (tkns.includes(log.address.toLocaleLowerCase())) {
        const { name, args } = CreditAccountWatcher.IERC20.parseLog(log);
        if (
          name === "Transfer" &&
          accAddresses.includes(args.to.toLowerCase())
        ) {
          modified.add(accToCa[args.to.toLowerCase()].hash());
        }
      }
    }
    return Array.from(modified);
  }
}
