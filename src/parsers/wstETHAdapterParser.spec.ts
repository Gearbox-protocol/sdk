import { WAD } from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";
import { encodeFunctionData } from "viem";

import { iwstEthv1AdapterAbi } from "../types-viem";
import { WstETHAdapterParser } from "./wstETHAdapterParser";

describe("WstETHAdapterParser test", () => {
  it("wrap / unwrap function works well", () => {
    let parser = new WstETHAdapterParser("LIDO_WSTETH", false);

    let parsed = parser.parse(
      encodeFunctionData({
        abi: iwstEthv1AdapterAbi,
        functionName: "wrapDiff",
        args: [WAD * 1020n],
      }),
    );
    expect(parsed).to.be.eq(
      "wstETHAdapter[LIDO_WSTETH].wrapDiff(leftoverAmount: 1.02K [1020000000000000000000])",
      "Incorrect parse wrapDiff()",
    );

    parsed = parser.parse(
      encodeFunctionData({
        abi: iwstEthv1AdapterAbi,
        functionName: "unwrapDiff",
        args: [WAD * 1020n],
      }),
    );
    expect(parsed).to.be.eq(
      "wstETHAdapter[LIDO_WSTETH].unwrapDiff(leftoverAmount: 1.02K [1020000000000000000000])",
      "Incorrect parse unwrapDiff()",
    );

    parser = new WstETHAdapterParser("LIDO_WSTETH", true);

    parsed = parser.parse(
      encodeFunctionData({
        abi: iwstEthv1AdapterAbi,
        functionName: "wrap",
        args: [WAD * 1020n],
      }),
    );
    expect(parsed).to.be.eq(
      "Contract[LIDO_WSTETH].wrap(amount: 1.02K [1020000000000000000000])",
      "Incorrect parse wrap(amount)",
    );

    parsed = parser.parse(
      encodeFunctionData({
        abi: iwstEthv1AdapterAbi,
        functionName: "unwrap",
        args: [WAD * 1020n],
      }),
    );
    expect(parsed).to.be.eq(
      "Contract[LIDO_WSTETH].unwrap(amount: 1.02K [1020000000000000000000])",
      "Incorrect parse unwrap(amount)",
    );
  });
});
