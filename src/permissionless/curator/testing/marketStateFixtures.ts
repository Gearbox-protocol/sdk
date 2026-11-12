import { readFileSync } from "node:fs";
import type { MarketState } from "../state/market/types.js";

/**
 * Market states projected from the strategy bundles of the catalog, one per
 * bundle, frozen in a fixture: real, varied states to diff and simulate.
 **/
export function marketStateFixtures(): { name: string; state: MarketState }[] {
  const fixtures = JSON.parse(
    readFileSync(
      new URL("./fixtures/market-states.json", import.meta.url),
      "utf8",
    ),
  ) as Record<string, { after?: MarketState }>;
  return Object.entries(fixtures).flatMap(([name, { after }]) =>
    after ? [{ name, state: after }] : [],
  );
}
