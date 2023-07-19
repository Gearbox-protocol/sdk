import { expect } from "chai";
import { ethers } from "ethers";

import { IERC20Metadata__factory } from "../types";
import { IERC20MetadataInterface } from "../types/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata";
import safeMulticall, { MCall } from "../utils/multicall";
import { tokenDataByNetwork } from "./token";

describe("Tokens tests", () => {
  it("token symbols should match onchain symbols", async function (this: any) {
    this.timeout(10000);
    const provider = new ethers.providers.StaticJsonRpcProvider(
      process.env.MAINNET_TESTS_FORK,
    );
    const entries = Object.entries(tokenDataByNetwork.Mainnet).filter(
      ([_, addr]) => addr?.startsWith("0x"),
    );
    const erc20 = IERC20Metadata__factory.createInterface();

    const mcalls: MCall<IERC20MetadataInterface>[] = entries.map(
      ([, address]): MCall<IERC20MetadataInterface> => ({
        address,
        interface: erc20,
        method: "symbol()",
      }),
    );

    const resp = await safeMulticall<string>(mcalls, provider);
    const onchainMap: Record<string, string> = {};

    const sanitize = (symbol: string): string => {
      return symbol.replace(/\-f$/, "").replaceAll("-", "_");
    };

    for (let i = 0; i < entries.length; i++) {
      expect(resp[i].error).to.eq(false);
      onchainMap[sanitize(resp[i]?.value ?? "")] = entries[i][1];
    }

    // "NOT DEPLOYED" tokens were filtered out from entries
    expect(onchainMap).to.be.equal(Object.fromEntries(entries));
  });
});
