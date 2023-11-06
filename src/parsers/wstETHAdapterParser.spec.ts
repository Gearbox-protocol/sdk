import { WAD } from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";

import { IwstETHV1Adapter__factory } from "../types";
import { WstETHAdapterParser } from "./wstETHAdapterParser";

describe("WstETHAdapterParser test", () => {
  it("wrap / unwrap function works well", () => {
    let parser = new WstETHAdapterParser("LIDO_WSTETH", false);

    const ifc = IwstETHV1Adapter__factory.createInterface();

    let parsed = parser.parse(
      ifc.encodeFunctionData("wrapDiff", [WAD * 1020n]),
    );
    expect(parsed).to.be.eq(
      "wstETHAdapter[LIDO_WSTETH].wrapDiff(leftoverAmount: 1.02K [1020000000000000000000])",
      "Incorrect parse wrapDiff()",
    );

    parsed = parser.parse(ifc.encodeFunctionData("unwrapDiff", [WAD * 1020n]));
    expect(parsed).to.be.eq(
      "wstETHAdapter[LIDO_WSTETH].unwrapDiff(leftoverAmount: 1.02K [1020000000000000000000])",
      "Incorrect parse unwrapDiff()",
    );

    parser = new WstETHAdapterParser("LIDO_WSTETH", true);

    parsed = parser.parse(ifc.encodeFunctionData("wrap", [WAD * 1020n]));
    expect(parsed).to.be.eq(
      "Contract[LIDO_WSTETH].wrap(amount: 1.02K [1020000000000000000000])",
      "Incorrect parse wrap(amount)",
    );

    parsed = parser.parse(ifc.encodeFunctionData("unwrap", [WAD * 1020n]));
    expect(parsed).to.be.eq(
      "Contract[LIDO_WSTETH].unwrap(amount: 1.02K [1020000000000000000000])",
      "Incorrect parse unwrap(amount)",
    );
  });
});
