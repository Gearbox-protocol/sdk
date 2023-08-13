import { expect } from "chai";
import { providers } from "ethers";

import { RAY } from "../core/constants";
import { tokenDataByNetwork } from "../tokens/token";
import { CloseResult, PathFinder } from "./pathfinder";

describe("PathFinder test", () => {
  it("compare works correctly", () => {
    const r1: CloseResult = {
      amount: 2000n,
      gasUsage: 1000n,
      calls: [],
    };

    const r2: CloseResult = {
      amount: 3000n,
      gasUsage: 2000n,
      calls: [],
    };

    let result = PathFinder.compare(r1, r2, RAY);
    expect(result).to.be.eql(r2);

    result = PathFinder.compare(r1, r2, RAY * 2n);
    expect(result).to.be.eql(r1);
  });
  it("has all expected connectors", () => {
    const pf = new PathFinder("", new providers.JsonRpcProvider(), "Mainnet");
    const allowedTokens = {
      [tokenDataByNetwork.Mainnet.USDC]: true,
      [tokenDataByNetwork.Mainnet.WETH]: true,
      [tokenDataByNetwork.Mainnet.DAI]: true,
      [tokenDataByNetwork.Mainnet.FRAX]: true,
    } as const;
    expect(pf.getAvailableConnectors(allowedTokens)).to.be.deep.equal([
      tokenDataByNetwork.Mainnet.USDC,
      tokenDataByNetwork.Mainnet.WETH,
      tokenDataByNetwork.Mainnet.DAI,
      tokenDataByNetwork.Mainnet.FRAX,
    ]);
  });
});
