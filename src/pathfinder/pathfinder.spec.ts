import { tokenDataByNetwork } from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";
import type { Address } from "viem";
import { createPublicClient, http } from "viem";

import type { PathFinderResult } from "./core";
import { PathFinder } from "./pathfinder";

describe("PathFinder test", () => {
  it("compare works correctly", () => {
    const r1: PathFinderResult = {
      minAmount: 2000n,
      amount: 20000n,
      calls: [],
    };

    const r2: PathFinderResult = {
      minAmount: 3000n,
      amount: 30000n,
      calls: [],
    };

    let result = PathFinder.compare(r1, r2);
    expect(result).to.be.eql(r2);
  });
  it("has all expected connectors", () => {
    const pf = new PathFinder(
      "" as Address,
      createPublicClient({ transport: http("https://mainnet.infura.io/v3/") }),
      "Mainnet",
    );
    const allowedTokens = {
      [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: true,
      [tokenDataByNetwork.Mainnet.DAI.toLowerCase()]: true,
      [tokenDataByNetwork.Mainnet.USDC.toLowerCase()]: true,
      [tokenDataByNetwork.Mainnet.FRAX.toLowerCase()]: true,
      [tokenDataByNetwork.Mainnet.rETH.toLowerCase()]: true,
    } as const;
    expect(pf.getAvailableConnectors(allowedTokens)).to.be.deep.equal([
      tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
      tokenDataByNetwork.Mainnet.DAI.toLowerCase(),
      tokenDataByNetwork.Mainnet.USDC.toLowerCase(),
      tokenDataByNetwork.Mainnet.FRAX.toLowerCase(),
      tokenDataByNetwork.Mainnet.rETH.toLowerCase(),
    ]);
  });
  it("has all expected connectors, when gew are disabled", () => {
    const pf = new PathFinder(
      "" as Address,
      createPublicClient({ transport: http("https://mainnet.infura.io/v3/") }),
      "Mainnet",
    );
    const allowedTokens = {
      [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: true,
      [tokenDataByNetwork.Mainnet.DAI.toLowerCase()]: true,
      [tokenDataByNetwork.Mainnet.rETH.toLowerCase()]: true,
    } as const;
    expect(pf.getAvailableConnectors(allowedTokens)).to.be.deep.equal([
      tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
      tokenDataByNetwork.Mainnet.DAI.toLowerCase(),
      tokenDataByNetwork.Mainnet.rETH.toLowerCase(),
    ]);
  });
});
