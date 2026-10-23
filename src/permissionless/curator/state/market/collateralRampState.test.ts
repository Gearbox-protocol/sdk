import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { CreditSuite } from "../../../../onchain/market/credit/CreditSuite.js";
import { buildCollateralTokensState } from "./getMarketState.js";

interface MulticallArgs {
  contracts: {
    address: Address;
    functionName: string;
    args: readonly [Address];
  }[];
  allowFailure: boolean;
}

const manager: Address = "0x1111111111111111111111111111111111111111";
const underlying: Address = "0x2222222222222222222222222222222222222222";
const staticToken: Address = "0x3333333333333333333333333333333333333333";
const activeToken: Address = "0x4444444444444444444444444444444444444444";
const completedToken: Address = "0x5555555555555555555555555555555555555555";

describe("collateral ramp market state", () => {
  it("reads final LT and stored ramp parameters while treating the underlying and static thresholds specially", async () => {
    const suite = {
      creditManager: {
        address: manager,
        underlying,
        collateralTokens: [
          underlying,
          staticToken,
          activeToken,
          completedToken,
        ],
        liquidationThresholds: {
          mustGet: (token: Address) => (token === underlying ? 9500 : 7500),
        },
      },
      // as the SDK's CreditSuite decodes the facade's forbidden token mask
      forbiddenTokens: [activeToken],
      sdk: {
        client: {
          multicall: async ({ contracts, allowFailure }: MulticallArgs) => {
            expect(allowFailure).toBe(false);
            expect(contracts.map(contract => contract.args[0])).toEqual([
              staticToken,
              activeToken,
              completedToken,
            ]);
            expect(
              contracts.every(
                contract =>
                  contract.address === manager &&
                  contract.functionName === "ltParams",
              ),
            ).toBe(true);
            return [
              [9000, 9000, 2 ** 40 - 1, 0],
              [8000, 6000, 1_800_000_000, 172_800],
              [7000, 5000, 1_600_000_000, 172_800],
            ];
          },
        },
      },
    };

    // Only what the reader uses of a credit suite and its client.
    const state = await buildCollateralTokensState(
      suite as unknown as CreditSuite,
    );
    expect(state[underlying]).toEqual({
      liquidationThresholdFinal: 95,
      rampStart: 0,
      rampDuration: 0,
      isForbidden: false,
    });
    expect(state[staticToken]).toEqual({
      liquidationThresholdFinal: 90,
      rampStart: 0,
      rampDuration: 0,
      isForbidden: false,
    });
    expect(state[activeToken]).toEqual({
      liquidationThresholdFinal: 60,
      rampStart: 1_800_000_000,
      rampDuration: 172_800,
      isForbidden: true,
    });
    expect(state[completedToken]).toEqual({
      liquidationThresholdFinal: 50,
      rampStart: 1_600_000_000,
      rampDuration: 172_800,
      isForbidden: false,
    });
  });
});
