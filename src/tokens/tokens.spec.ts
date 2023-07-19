import { expect } from "chai";
import { ethers } from "ethers";

import { IERC20Metadata__factory } from "../types";
import { IERC20MetadataInterface } from "../types/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata";
import { MCall, multicall } from "../utils/multicall";
import { tokenDataByNetwork } from "./token";

describe("Tokens tests", () => {
  it("token symbols should match onchain symbols", async function (this: any) {
    this.timeout(10000);
    const provider = new ethers.providers.StaticJsonRpcProvider(
      process.env.MAINNET_TESTS_FORK,
    );
    const entries = Object.entries(tokenDataByNetwork.Mainnet);
    const erc20 = IERC20Metadata__factory.createInterface();

    const mcalls: MCall<IERC20MetadataInterface>[] = entries.map(
      ([, address]) => ({
        address,
        interface: erc20,
        method: "symbol()",
      }),
    );

    const onchainSymbols = await multicall<string[]>(mcalls, provider);
    const onchainMap: Record<string, string> = {};

    const sanitize = (symbol: string): string => {
      return symbol.replace(/\-f$/, "").replaceAll("-", "_");
    };

    for (let i = 0; i < entries.length; i++) {
      onchainMap[sanitize(onchainSymbols[i])] = entries[i][1];
    }

    expect(onchainMap).to.be.equal(tokenDataByNetwork.Mainnet);
  });
});
