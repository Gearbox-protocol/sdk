import { expect } from "chai";

import { WAD } from "../core/constants";
import { IConvexV1BoosterAdapter__factory } from "../types";
import { ConvexBoosterAdapterParser } from "./convexBoosterAdapterParser";

describe("ConvexV1BaseRewardPoolAdapterParser test", () => {
  it("stake / withdraw functions works well", () => {
    let parser = new ConvexBoosterAdapterParser("CONVEX_BOOSTER", false);

    const ifc = IConvexV1BoosterAdapter__factory.createInterface();

    let parsed = parser.parse(
      ifc.encodeFunctionData("deposit", [9, WAD.mul(19999), false]),
    );
    expect(parsed).to.be.eq(
      "ConvexV1BoosterAdapter[CONVEX_BOOSTER].deposit(pid: 9 [CONVEX_3CRV_POOL], amount: 19.99K [19999000000000000000000], stake: false)",
      "Incorrect parse deposit",
    );

    parsed = parser.parse(ifc.encodeFunctionData("depositAll", [32, true]));
    expect(parsed).to.be.eq(
      "ConvexV1BoosterAdapter[CONVEX_BOOSTER].depositAll(pid: 32 [CONVEX_FRAX3CRV_POOL], stake: true)",
      "Incorrect parse depositAll",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("withdraw", [9, WAD.mul(555).div(10)]),
    );
    expect(parsed).to.be.eq(
      "ConvexV1BoosterAdapter[CONVEX_BOOSTER].withdraw(pid: 9 [CONVEX_3CRV_POOL], amount: 55.50 [55500000000000000000])",
      "Incorrect parse withdraw",
    );

    parsed = parser.parse(ifc.encodeFunctionData("withdrawAll", [32]));
    expect(parsed).to.be.eq(
      "ConvexV1BoosterAdapter[CONVEX_BOOSTER].withdrawAll(pid: 32 [CONVEX_FRAX3CRV_POOL])",
      "Incorrect parse withdrawAll",
    );
  });
});
