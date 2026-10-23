import type { ActionEnv } from "../actions/actionTypes.js";
import type { GipMarketAction } from "../actions/types.js";
import { actionEnv } from "../executor/actionEnv.js";
import type { MarketState } from "../state/market/types.js";

/** Heuristic gas of an action's payload call; see `MarketActionDefinition.gas`. **/
export function estimateActionGas(args: {
  action: GipMarketAction;
  afterState: MarketState;
  /** Defaults to the built-in registry at the current time. **/
  env?: ActionEnv;
}): number {
  const { action, afterState, env = actionEnv() } = args;
  return env.registry.requireMarketAction(action.type).gas({
    params: action.params,
    after: afterState,
    env,
  });
}
