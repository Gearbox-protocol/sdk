/**
 * Compile-time checks of the action registries: the unions are derived from
 * the registered definitions, so these fail when the derivation degrades (to
 * `any`, `never` or a lost member) rather than when a definition is added.
 **/
import { describe, it } from "vitest";
import type {
  ExternalAdapterAction,
  GipMarketAction,
  MarketActions,
  MarketActionType,
  ValidMarketAction,
} from "./actions/types.js";
import type { ConfiguratorActions } from "./configurator-actions/types.js";
import type { MarketScopedAction } from "./session/actionScope.js";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;
/** Number of members of a union of string literals. **/
type UnionSize<U, Acc extends unknown[] = []> = [U] extends [never]
  ? Acc["length"]
  : UnionSize<Exclude<U, LastOf<U>>, [...Acc, LastOf<U>]>;
type LastOf<U> = (
  (U extends unknown ? (x: () => U) => void : never) extends (
    x: infer I,
  ) => void
    ? I
    : never
) extends () => infer L
  ? L
  : never;

describe("action registry types", () => {
  it("derives the action unions from the registered definitions", () => {
    // The tuple fails to compile when one of its assertions does not hold.
    type Checks = [
      Assert<Equal<IsAny<MarketActions>, false>>,
      Assert<Equal<UnionSize<MarketActionType>, 48>>,
      Assert<Equal<UnionSize<ConfiguratorActions["type"]>, 6>>,
      // The market scope takes built-in actions and those of registered plugins.
      Assert<Equal<MarketScopedAction, GipMarketAction>>,
      Assert<Equal<GipMarketAction, MarketActions | ExternalAdapterAction>>,
      // A built-in type keeps its own params; any other adapter type is external.
      Assert<
        Equal<
          ValidMarketAction<{
            type: "POOL::setTotalDebtLimit";
            params: object;
          }>,
          Extract<MarketActions, { type: "POOL::setTotalDebtLimit" }>
        >
      >,
      Assert<
        Equal<
          ValidMarketAction<{
            type: "ADAPTER::TEST_ROUTER::setPools";
            params: object;
          }>,
          ExternalAdapterAction
        >
      >,
      Assert<
        Equal<
          Extract<
            ConfiguratorActions,
            { type: "TREASURY_SPLITTER::distribute" }
          >["params"],
          { token: `0x${string}` }
        >
      >,
      // A member keeps its params type, not a widened one.
      Assert<
        Equal<
          Extract<MarketActions, { type: "POOL::setTotalDebtLimit" }>["params"],
          { limit: number | string }
        >
      >,
    ];
    const checks: Checks | undefined = undefined;
    void checks;
  });
});
