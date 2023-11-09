import { WAD } from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";

import { IConvexV1BaseRewardPoolAdapter__factory } from "../types";
import { ConvexBaseRewardPoolAdapterParser } from "./convexBaseRewardPoolAdapterParser";

describe("ConvexV1BaseRewardPoolAdapterParser test", () => {
  it("stake / withdraw functions works well", () => {
    let parser = new ConvexBaseRewardPoolAdapterParser(
      "CONVEX_FRAX3CRV_POOL",
      false,
    );

    const ifc = IConvexV1BaseRewardPoolAdapter__factory.createInterface();

    let parsed = parser.parse(
      ifc.encodeFunctionData("stake", [(WAD * 199n) / 10n]),
    );
    expect(parsed).to.be.eq(
      "ConvexV1BaseRewardPoolAdapter[CONVEX_FRAX3CRV_POOL].stake(amount: 19.90 [19900000000000000000])",
      "Incorrect parse stake",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("stakeDiff", [(WAD * 199n) / 10n]),
    );
    expect(parsed).to.be.eq(
      "ConvexV1BaseRewardPoolAdapter[CONVEX_FRAX3CRV_POOL].stakeDiff(leftoverAmount: 19.90 [19900000000000000000])",
      "Incorrect parse stakeDiff",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("withdraw", [(WAD * 199n) / 1000n, false]),
    );
    expect(parsed).to.be.eq(
      "ConvexV1BaseRewardPoolAdapter[CONVEX_FRAX3CRV_POOL].withdraw(amount: 0.19 [199000000000000000], claim: false)",
      "Incorrect parse withdraw",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("withdrawAndUnwrap", [(WAD * 2n) / 1000n, true]),
    );
    expect(parsed).to.be.eq(
      "ConvexV1BaseRewardPoolAdapter[CONVEX_FRAX3CRV_POOL].withdrawAndUnwrap(amount: 0.002 [2000000000000000], claim: true)",
      "Incorrect parse withdrawAndUnwrap",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("withdrawDiff", [(WAD * 2n) / 1000n, false]),
    );
    expect(parsed).to.be.eq(
      "ConvexV1BaseRewardPoolAdapter[CONVEX_FRAX3CRV_POOL].withdrawDiff(leftoverAmount: 0.002 [2000000000000000], claim: false)",
      "Incorrect parse withdrawDiff",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("withdrawDiffAndUnwrap", [
        (WAD * 2n) / 1000n,
        true,
      ]),
    );
    expect(parsed).to.be.eq(
      "ConvexV1BaseRewardPoolAdapter[CONVEX_FRAX3CRV_POOL].withdrawDiffAndUnwrap(leftoverAmount: 0.002 [2000000000000000], claim: true)",
      "Incorrect parse withdrawDiffAndUnwrap",
    );
  });
});
