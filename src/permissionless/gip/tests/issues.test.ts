import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { IssueMarket } from "../core/issues/gip-issues.js";
import { getGipIssues } from "../index.js";

const pool = "0x1111111111111111111111111111111111111111" as Address;
const asset = "0x2222222222222222222222222222222222222222" as Address;
const nft = "0x3333333333333333333333333333333333333333" as Address;

describe("GIP issue checks", () => {
  it("finds issues from actions and caller-supplied chain reads in order", async () => {
    const reads: Address[] = [];
    const market = {
      address: pool,
      underlyingAsset: asset,
      transactions: [
        {
          type: "MARKET::createMarket",
          params: { rateKeeperParams: { type: "TUMBLER" } },
        },
        { type: "MARKET::addAsset", params: { token: asset } },
        { type: "MARKET::createCreditSuite", params: { whitelistPolicy: nft } },
      ],
    } as unknown as IssueMarket;

    const issues = await getGipIssues({
      markets: [market],
      balanceOf: async token => {
        reads.push(token);
        return 0n;
      },
      incompleteRwaSetups: async () => [],
      registeredPeripheryContracts: async () => [],
    });

    expect(reads).toEqual([asset]);
    expect(issues.map(({ type }) => type)).toEqual([
      "poolCreationDeposit",
      "updateRates",
      "missingReservePriceFeed",
      "degenNFTIsNotRegistered",
    ]);
    expect(issues[0]).toMatchObject({ token: asset, count: 1 });
    expect(issues[2]).toMatchObject({ market, assets: [asset] });
    expect(issues[3]).toMatchObject({ market, degenNFT: nft });
  });
});
