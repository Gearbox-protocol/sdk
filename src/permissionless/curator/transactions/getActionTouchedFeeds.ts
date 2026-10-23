import type { Address } from "viem";
import type { ActionEnv } from "../actions/actionTypes.js";
import type { GipMarketAction } from "../actions/types.js";
import { actionEnv } from "../executor/actionEnv.js";
import type { MarketState } from "../state/market/types.js";

/**
 * Price feeds an action's payload call reads; see
 * `MarketActionDefinition.touchedFeeds`.
 **/
export function getActionTouchedFeeds(args: {
  action: GipMarketAction;
  afterState: MarketState;
  /** Defaults to the built-in registry at the current time. **/
  env?: ActionEnv;
}): Address[] {
  const { action, afterState, env = actionEnv() } = args;
  return (
    env.registry.requireMarketAction(action.type).touchedFeeds?.({
      params: action.params,
      after: afterState,
      env,
    }) ?? []
  );
}
