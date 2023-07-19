/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { ethers } from "ethers";

import { CHAINS, NetworkType } from "../core/chains";
import { IERC20Metadata__factory } from "../types";
import { IERC20MetadataInterface } from "../types/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata";
import safeMulticall, { MCall } from "../utils/multicall";
import { tokenDataByNetwork } from "./token";

describe("Tokens", () => {
  const networkTypes: NetworkType[] = ["Mainnet", "Arbitrum"];

  networkTypes.forEach(network => {
    it(`${network} symbols should match onchain symbols`, async function (this: any) {
      this.timeout(20000);
      const url = process.env[`${network.toUpperCase()}_TESTS_FORK`];
      if (!url) {
        throw new Error(`${network} provder not found in env`);
      }
      const provider = new ethers.providers.StaticJsonRpcProvider(
        url,
        CHAINS[network],
      );
      const entries = Object.entries(tokenDataByNetwork[network]).filter(
        ([_, addr]) => addr?.startsWith("0x"),
      );
      const erc20 = IERC20Metadata__factory.createInterface();
      const onchainMap: Record<string, string> = {};
      const sanitize = (symbol: string): string => {
        return symbol.replace(/\-f$/, "").replaceAll("-", "_");
      };

      // even safe multicall fails when one of addresses is an EOA and not contract address
      if (network === "Arbitrum") {
        for (const [_, address] of entries) {
          const c = IERC20Metadata__factory.connect(address, provider);
          try {
            const s = await c.symbol();
            onchainMap[sanitize(s)] = address;
          } catch (e: any) {
            console.error(network, address, e.message);
          }
        }
      } else {
        const mcalls: MCall<IERC20MetadataInterface>[] = entries.map(
          ([, address]): MCall<IERC20MetadataInterface> => ({
            address,
            interface: erc20,
            method: "symbol()",
          }),
        );
        const resp = await safeMulticall<string>(mcalls, provider);
        for (let i = 0; i < entries.length; i++) {
          expect(resp[i].error).to.eq(false);
          onchainMap[sanitize(resp[i]?.value ?? "")] = entries[i][1];
        }
      }
      // "NOT DEPLOYED" tokens were filtered out from entries
      expect(onchainMap).to.be.equal(Object.fromEntries(entries));
    });
  });
});
