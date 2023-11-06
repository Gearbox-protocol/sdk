import { WAD } from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";

import { ILidoV1Adapter__factory } from "../types";
import { LidoAdapterParser } from "./lidoAdapterParser";

describe("LidoAdapterParser test", () => {
  it("submit & submitAll function works well", () => {
    let parser = new LidoAdapterParser("LIDO_STETH_GATEWAY", false);

    const ifc = ILidoV1Adapter__factory.createInterface();

    let parsed = parser.parse(ifc.encodeFunctionData("submit", [WAD * 1020n]));
    expect(parsed).to.be.eq(
      "LidoV1Adapter[LIDO_STETH_GATEWAY].submit(amount: 1.02K [1020000000000000000000])",
      "Incorrect parse submit(amount)",
    );

    parser = new LidoAdapterParser("LIDO_STETH_GATEWAY", true);
    parsed = parser.parse(ifc.encodeFunctionData("submitDiff", [WAD * 1020n]));
    expect(parsed).to.be.eq(
      "Contract[LIDO_STETH_GATEWAY].submitDiff(leftoverAmount: 1.02K [1020000000000000000000])",
      "Incorrect parse submitDiff(leftoverAmount)",
    );
  });
});
