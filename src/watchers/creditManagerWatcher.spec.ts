import { ADDRESS_0X0, DUMB_ADDRESS } from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";
import { providers, utils } from "ethers";

import { CreditManagerData } from "../core/creditManager";
import {
  ICreditConfiguratorV2__factory,
  ICreditManagerV2__factory,
  ICreditManagerV3__factory,
} from "../types";
import { CreditManagerWatcher } from "./creditManagerWatcher";

const CREDIT_MANAGER_ADDRESS = DUMB_ADDRESS;
const CREDIT_CONFIGIURATOR_ADDRESS =
  "0xcb9a588a47dd0393af3d0d5f86e6f1c8fd252c48";

const cmDumb = {
  address: CREDIT_MANAGER_ADDRESS.toLowerCase(),
  creditConfigurator: CREDIT_CONFIGIURATOR_ADDRESS.toLowerCase(),
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

describe("CreditManagerTracker test", () => {
  it("detects CreditManagerV2 events correctly", () => {
    const cmV2Interface = ICreditManagerV2__factory.createInterface();

    let log = makeLog(CREDIT_MANAGER_ADDRESS, [
      cmV2Interface.getEventTopic("NewConfigurator"),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(CREDIT_MANAGER_ADDRESS, [
      cmV2Interface.getEventTopic("ExecuteOrder"),
      encode("address", DUMB_ADDRESS),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      false,
    );
  });

  it("detects CreditManagerV3 events correctly", () => {
    const cmV3Interface = ICreditManagerV3__factory.createInterface();

    let log = makeLog(CREDIT_MANAGER_ADDRESS, [
      cmV3Interface.getEventTopic("SetCreditConfigurator"),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );
  });

  it("detects CreditConfigurator events correctly", () => {
    const ccInterface = ICreditConfiguratorV2__factory.createInterface();

    let log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [
        ccInterface.getEventTopic("TokenLiquidationThresholdUpdated"),
        encode("address", DUMB_ADDRESS),
      ],
      encode("uint16", 122),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(CREDIT_CONFIGIURATOR_ADDRESS, [
      ccInterface.getEventTopic("TokenAllowed"),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(CREDIT_CONFIGIURATOR_ADDRESS, [
      ccInterface.getEventTopic("TokenForbidden"),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(CREDIT_CONFIGIURATOR_ADDRESS, [
      ccInterface.getEventTopic("ContractAllowed"),
      encode("address", DUMB_ADDRESS),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(CREDIT_CONFIGIURATOR_ADDRESS, [
      ccInterface.getEventTopic("ContractForbidden"),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [ccInterface.getEventTopic("LimitsUpdated")],
      utils.defaultAbiCoder.encode(["uint256", "uint256"], [50, 200]),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [ccInterface.getEventTopic("FeesUpdated")],
      utils.defaultAbiCoder.encode(
        ["uint16", "uint16", "uint16", "uint16", "uint16"],
        [50, 50, 50, 50, 50],
      ),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(CREDIT_CONFIGIURATOR_ADDRESS, [
      ccInterface.getEventTopic("PriceOracleUpgraded"),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(CREDIT_CONFIGIURATOR_ADDRESS, [
      ccInterface.getEventTopic("CreditFacadeUpgraded"),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(CREDIT_CONFIGIURATOR_ADDRESS, [
      ccInterface.getEventTopic("CreditConfiguratorUpgraded"),
      encode("address", DUMB_ADDRESS),
    ]);

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [ccInterface.getEventTopic("IncreaseDebtForbiddenModeChanged")],
      encode("bool", true),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [ccInterface.getEventTopic("LimitPerBlockUpdated")],
      encode("uint128", 122),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [ccInterface.getEventTopic("AddedToUpgradeable")],
      encode("address", DUMB_ADDRESS),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [ccInterface.getEventTopic("RemovedFromUpgradeable")],
      encode("address", DUMB_ADDRESS),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [ccInterface.getEventTopic("ExpirationDateUpdated")],
      encode("uint40", Math.floor(Date.now() / 1000)),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [ccInterface.getEventTopic("MaxEnabledTokensUpdated")],
      encode("uint8", 14),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [ccInterface.getEventTopic("EmergencyLiquidatorAdded")],
      encode("address", DUMB_ADDRESS),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );

    log = makeLog(
      CREDIT_CONFIGIURATOR_ADDRESS,
      [ccInterface.getEventTopic("EmergencyLiquidatorRemoved")],
      encode("address", DUMB_ADDRESS),
    );

    expect(CreditManagerWatcher.detectConfigChanges([log], [cmDumb])).to.be.eq(
      true,
    );
  });
});
