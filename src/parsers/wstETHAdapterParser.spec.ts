import { WAD } from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";

import { IwstETHV1Adapter__factory } from "../types";
import { WstETHAdapterParser } from "./wstETHAdapterParser";

describe("WstETHAdapterParser test", () => {
  it("wrap / unwrap function works well", () => {
    let parser = new WstETHAdapterParser("LIDO_WSTETH", false);

    const ifc = IwstETHV1Adapter__factory.createInterface();

    let parsed = parser.parse(ifc.encodeFunctionData("wrapAll"));
    expect(parsed).to.be.eq(
      "wstETHAdapter[LIDO_WSTETH].wrapAll()",
      "Incorrect parse wrapAll()",
    );

    parsed = parser.parse(ifc.encodeFunctionData("unwrapAll"));
    expect(parsed).to.be.eq(
      "wstETHAdapter[LIDO_WSTETH].unwrapAll()",
      "Incorrect parse unwrapAll()",
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
