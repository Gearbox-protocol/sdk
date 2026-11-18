import { describe, expect, it } from "vitest";
import { ANVIL_URL } from "../constants.js";
import { executedGips } from "../curator/executedGips.js";
import {
  describeSimulation,
  reproduceExecutedGip,
  simulationMatches,
} from "../curator/reproduceExecutedGip.js";
import { useFixture } from "../helpers.js";

/**
 * GIPs executed on mainnet, assembled with the curator on a fork of the block
 * before their execution: the payload calls must hash to what the TimeLock
 * executed, in order, and each scope's simulation must match its projection.
 **/
describe("curator: executed mainnet GIPs", () => {
  for (const reproduction of executedGips) {
    const { gip } = reproduction;

    describe(`${gip.name} (${gip.id})`, () => {
      useFixture({ network: "Mainnet", block: gip.executedAtBlock - 1n });

      it("rebuilds the executed calls, and simulating them matches the projection", async () => {
        const { builtHashes, simulations } = await reproduceExecutedGip(
          reproduction,
          ANVIL_URL,
        );

        expect(builtHashes).toEqual(gip.timelockTxHashes);
        for (const { label, outcome } of simulations) {
          expect(
            simulationMatches(outcome),
            `${label}: ${describeSimulation(outcome)}`,
          ).toBe(true);
        }
      });
    });
  }
});
