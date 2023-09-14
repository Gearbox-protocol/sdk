import { ADDRESS_0X0, DUMB_ADDRESS } from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";
import { providers, utils } from "ethers";

import { CreditManagerData } from "../core/creditManager";
import {
  ICreditConfiguratorV2__factory,
  ICreditFacadeV2__factory,
  ICreditManagerV2__factory,
} from "../types";
import { CreditAccountWatcher } from "./creditAccountWatcher";

const CREDIT_MANAGER_ADDRESS = DUMB_ADDRESS;
const CREDIT_FACADE_ADDRESS = "0xcb9a588a47dd0393af3d0d5f86e6f1c8fd252c48";
const CREDIT_FACADE_NEW = "0xcb9a588a47dd0393af3d0d5f86e6f1c8fd252ccc";
const CREDIT_CONFIGURATOR_ADDRESS =
  "0xcb9a588a47dd0393af3d0d5f86e6f1c8fd252aaa";
const CREDIT_CONFIGURATOR_NEW = "0xcb9a588a47dd0393af3d0d5f86e6f1c8fd252000";

const BORROWER = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

const expectedHash = `${CREDIT_MANAGER_ADDRESS.toLowerCase()}:${BORROWER.toLowerCase()}`;

const creditManagerInterface = ICreditManagerV2__factory.createInterface();
const creditFacadeInterface = ICreditFacadeV2__factory.createInterface();
const creditConfiguratorInterface =
  ICreditConfiguratorV2__factory.createInterface();

const cmDumb = {
  address: CREDIT_MANAGER_ADDRESS.toLowerCase(),
  creditFacade: CREDIT_FACADE_ADDRESS.toLowerCase(),
  creditConfigurator: CREDIT_CONFIGURATOR_ADDRESS.toLowerCase(),
} as CreditManagerData;

const encode = (abiType: string, value: any) =>
  utils.defaultAbiCoder.encode([abiType], [value]);

const makeLog = (
  address: string,
  topics: Array<string>,
  data: string = ADDRESS_0X0,
): providers.Log => {
  return {
    blockNumber: 0,
    blockHash: "",
    transactionIndex: 0,
    removed: false,
    address,
    data,
    topics,
    transactionHash: "",
    logIndex: 0,
  };
};

const openLog = (facadeAddr = CREDIT_FACADE_ADDRESS) =>
  makeLog(
    facadeAddr,
    [
      creditFacadeInterface.getEventTopic("OpenCreditAccount"),
      encode("address", BORROWER),
      encode("address", DUMB_ADDRESS),
    ],
    utils.defaultAbiCoder.encode(["uint256", "uint16"], [10, 10]),
  );

const closeLog = (facadeAddr = CREDIT_FACADE_ADDRESS) =>
  makeLog(facadeAddr, [
    creditFacadeInterface.getEventTopic("CloseCreditAccount"),
    encode("address", BORROWER),
    encode("address", DUMB_ADDRESS),
    encode("address", DUMB_ADDRESS),
  ]);

const upgradeFacadeLog = (
  configuratorAddr = CREDIT_CONFIGURATOR_NEW,
  facadeAddr = CREDIT_FACADE_NEW,
) =>
  makeLog(configuratorAddr, [
    creditConfiguratorInterface.getEventTopic("CreditFacadeUpgraded"),
    encode("address", facadeAddr),
  ]);

const newConfiguratorLog = (
  managerAddr = CREDIT_MANAGER_ADDRESS,
  configuratorAddr = CREDIT_CONFIGURATOR_NEW,
) =>
  makeLog(managerAddr, [
    creditManagerInterface.getEventTopic("NewConfigurator"),
    encode("address", configuratorAddr),
  ]);

describe("CreditAccountTracker test", () => {
  it("detects update events correctly", () => {
    expect(CreditAccountWatcher.detectChanges([openLog()], [cmDumb])).to.be.eql(
      {
        updated: [expectedHash],
        deleted: [],
      },
    );

    let log = makeLog(
      CREDIT_FACADE_ADDRESS,
      [
        creditFacadeInterface.getEventTopic("IncreaseBorrowedAmount"),
        encode("address", BORROWER),
      ],
      utils.defaultAbiCoder.encode(["uint256"], [10]),
    );

    expect(CreditAccountWatcher.detectChanges([log], [cmDumb])).to.be.eql({
      updated: [expectedHash],
      deleted: [],
    });

    log = makeLog(
      CREDIT_FACADE_ADDRESS,
      [
        creditFacadeInterface.getEventTopic("DecreaseBorrowedAmount"),
        encode("address", BORROWER),
      ],
      utils.defaultAbiCoder.encode(["uint256"], [10]),
    );

    expect(CreditAccountWatcher.detectChanges([log], [cmDumb])).to.be.eql({
      updated: [expectedHash],
      deleted: [],
    });

    log = makeLog(
      CREDIT_FACADE_ADDRESS,
      [
        creditFacadeInterface.getEventTopic("AddCollateral"),
        encode("address", BORROWER),
        encode("address", DUMB_ADDRESS),
      ],
      utils.defaultAbiCoder.encode(["uint256"], [10]),
    );

    expect(CreditAccountWatcher.detectChanges([log], [cmDumb])).to.be.eql({
      updated: [expectedHash],
      deleted: [],
    });

    log = makeLog(CREDIT_FACADE_ADDRESS, [
      creditFacadeInterface.getEventTopic("MultiCallStarted"),
      encode("address", BORROWER),
    ]);

    expect(CreditAccountWatcher.detectChanges([log], [cmDumb])).to.be.eql({
      updated: [expectedHash],
      deleted: [],
    });

    log = makeLog(CREDIT_FACADE_ADDRESS, [
      creditFacadeInterface.getEventTopic("TokenEnabled"),
      encode("address", BORROWER),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditAccountWatcher.detectChanges([log], [cmDumb])).to.be.eql({
      updated: [expectedHash],
      deleted: [],
    });

    log = makeLog(CREDIT_FACADE_ADDRESS, [
      creditFacadeInterface.getEventTopic("TokenDisabled"),
      encode("address", BORROWER),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditAccountWatcher.detectChanges([log], [cmDumb])).to.be.eql({
      updated: [expectedHash],
      deleted: [],
    });

    log = makeLog(CREDIT_MANAGER_ADDRESS, [
      creditManagerInterface.getEventTopic("ExecuteOrder"),
      encode("address", BORROWER),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditAccountWatcher.detectChanges([log], [cmDumb])).to.be.eql({
      updated: [expectedHash],
      deleted: [],
    });
  });

  //
  // DELETED
  //
  it("detects delete events correctly", () => {
    expect(
      CreditAccountWatcher.detectChanges([closeLog()], [cmDumb]),
    ).to.be.eql({
      updated: [],
      deleted: [expectedHash],
    });

    let log = makeLog(
      CREDIT_FACADE_ADDRESS,
      [
        creditFacadeInterface.getEventTopic("LiquidateCreditAccount"),
        encode("address", BORROWER),
        encode("address", DUMB_ADDRESS),
        encode("address", DUMB_ADDRESS),
        encode("address", DUMB_ADDRESS),
      ],
      utils.defaultAbiCoder.encode(["uint256"], [10]),
    );

    expect(CreditAccountWatcher.detectChanges([log], [cmDumb])).to.be.eql({
      updated: [],
      deleted: [expectedHash],
    });

    log = makeLog(
      CREDIT_FACADE_ADDRESS,
      [
        creditFacadeInterface.getEventTopic("LiquidateExpiredCreditAccount"),
        encode("address", BORROWER),
        encode("address", DUMB_ADDRESS),
        encode("address", DUMB_ADDRESS),
        encode("address", DUMB_ADDRESS),
      ],
      utils.defaultAbiCoder.encode(["uint256"], [10]),
    );

    expect(CreditAccountWatcher.detectChanges([log], [cmDumb])).to.be.eql({
      updated: [],
      deleted: [expectedHash],
    });
  });
  it("doesn't make duplicated", () => {
    expect(
      CreditAccountWatcher.detectChanges(
        [openLog(), openLog(), openLog()],
        [cmDumb],
      ),
    ).to.be.eql({
      updated: [expectedHash],
      deleted: [],
    });

    expect(
      CreditAccountWatcher.detectChanges(
        [closeLog(), closeLog(), closeLog()],
        [cmDumb],
      ),
    ).to.be.eql({
      updated: [],
      deleted: [expectedHash],
    });
  });

  it("updates accounts were created and deleted in the batch", () => {
    expect(
      CreditAccountWatcher.detectChanges([openLog(), closeLog()], [cmDumb]),
    ).to.be.eql({
      updated: [],
      deleted: [expectedHash],
    });

    expect(
      CreditAccountWatcher.detectChanges(
        [openLog(), closeLog(), openLog()],
        [cmDumb],
      ),
    ).to.be.eql({
      updated: [expectedHash],
      deleted: [expectedHash],
    });
  });

  it("TransferAccount works correctly", () => {
    const transferLog = makeLog(CREDIT_FACADE_ADDRESS, [
      creditFacadeInterface.getEventTopic("TransferAccount"),
      encode("address", BORROWER),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(
      CreditAccountWatcher.detectChanges([openLog(), transferLog], [cmDumb]),
    ).to.be.eql({
      updated: [
        `${CREDIT_MANAGER_ADDRESS.toLowerCase()}:${DUMB_ADDRESS.toLowerCase()}`,
      ],
      deleted: [expectedHash],
    });
  });

  it("correctly handles credit configurator change", () => {
    expect(
      CreditAccountWatcher.detectChanges(
        [
          openLog(), // open CA in old CF
          newConfiguratorLog(), // set new configurator
          upgradeFacadeLog(), // in this new configurator, upgrade facade
          closeLog(CREDIT_FACADE_NEW),
        ],
        [cmDumb],
      ),
    ).to.be.eql({
      updated: [],
      deleted: [expectedHash],
    });

    expect(
      CreditAccountWatcher.detectChanges(
        [
          openLog(),
          closeLog(),
          newConfiguratorLog(), // set new configurator
          upgradeFacadeLog(), // in this new configurator, upgrade facade,
          openLog(CREDIT_FACADE_NEW),
        ],
        [cmDumb],
      ),
    ).to.be.eql({
      updated: [expectedHash],
      deleted: [expectedHash],
    });
  });
});
