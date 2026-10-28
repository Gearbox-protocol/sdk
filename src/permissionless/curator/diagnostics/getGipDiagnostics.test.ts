import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { GipMarketAction } from "../actions/types.js";
import { getGipDiagnostics } from "./getGipDiagnostics.js";

const pool: Address = "0x1111111111111111111111111111111111111111";
const asset: Address = "0x2222222222222222222222222222222222222222";
const nft: Address = "0x3333333333333333333333333333333333333333";

describe("GIP diagnostic checks", () => {
  it("finds diagnostics from actions and caller-supplied chain reads in order", async () => {
    const reads: Address[] = [];
    const market = {
      address: pool,
      underlyingAsset: asset,
      // Only the params the checks read.
      transactions: [
        {
          type: "MARKET::createMarket",
          params: { rateKeeperParams: { type: "TUMBLER" } },
        },
        { type: "MARKET::addAsset", params: { token: asset } },
        { type: "MARKET::createCreditSuite", params: { whitelistPolicy: nft } },
      ] as unknown as GipMarketAction[],
    };

    const diagnostics = await getGipDiagnostics({
      markets: [market],
      balanceOf: async token => {
        reads.push(token);
        return 0n;
      },
      incompleteRwaSetups: async () => [],
      registeredPeripheryContracts: async () => [],
    });

    expect(reads).toEqual([asset]);
    expect(diagnostics.map(({ type }) => type)).toEqual([
      "poolCreationDeposit",
      "updateRates",
      "missingReservePriceFeed",
      "degenNFTIsNotRegistered",
    ]);
    expect(diagnostics[0]).toMatchObject({ token: asset, count: 1 });
    expect(diagnostics[2]).toMatchObject({ market, assets: [asset] });
    expect(diagnostics[3]).toMatchObject({ market, degenNFT: nft });
  });
});
