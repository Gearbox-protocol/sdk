import {
  decimals,
  toBigInt,
  tokenDataByNetwork,
  WAD,
} from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";

import { ICreditFacadeV2Extended__factory } from "../types";
import { CreditFacadeParser } from "./creditFacadeParser";

describe("CreditFacadeParser test", () => {
  it("all functions works well", () => {
    let parser = new CreditFacadeParser("DAI", 1);

    const ifc = ICreditFacadeV2Extended__factory.createInterface();

    let parsed = parser.parse(
      ifc.encodeFunctionData("addCollateral", [
        tokenDataByNetwork.Mainnet.WBTC,
        (10n ** toBigInt(decimals.WBTC) * 444n) / 10n,
      ]),
    );
    expect(parsed).to.be.eq(
      "CreditFacade[DAI].addCollateral(token: WBTC, amount: 44.40 [4440000000])",
      "Incorrect parse addCollateral",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("increaseDebt", [(WAD * 414n) / 10n]),
    );
    expect(parsed).to.be.eq(
      "CreditFacade[DAI].increaseDebt(amount: 41.40 [41400000000000000000])",
      "Incorrect parse increaseDebt",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("decreaseDebt", [(WAD * 334n) / 10n]),
    );
    expect(parsed).to.be.eq(
      "CreditFacade[DAI].decreaseDebt(amount: 33.40 [33400000000000000000])",
      "Incorrect parse decreaseDebt",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("enableToken", [tokenDataByNetwork.Mainnet.WETH]),
    );
    expect(parsed).to.be.eq(
      "CreditFacade[DAI].enableToken(token: WETH)",
      "Incorrect parse enableToken",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("disableToken", [tokenDataByNetwork.Mainnet.LINK]),
    );
    expect(parsed).to.be.eq(
      "CreditFacade[DAI].disableToken(token: LINK)",
      "Incorrect parse disableToken",
    );
  });
});
