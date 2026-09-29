import type { MarketActions } from "../actions/index.js";
import type { MarketState } from "../market-state/types.js";

export async function getInitialMarketState(args: {
  initialState: MarketState | null;
  actions: MarketActions[];
  loadDeployedState: () => Promise<MarketState | null>;
}): Promise<MarketState | null> {
  if (args.initialState) return args.initialState;
  if (args.actions[0]?.type === "MARKET::createMarket") return null;
  return args.loadDeployedState();
}
