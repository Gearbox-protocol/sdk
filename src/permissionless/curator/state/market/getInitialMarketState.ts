import type { MarketActions } from "../../actions/types.js";
import type { MarketState } from "./types.js";

export async function getInitialMarketState(args: {
  initialState: MarketState | null;
  actions: MarketActions[];
  loadDeployedState: () => Promise<MarketState | null>;
}): Promise<MarketState | null> {
  if (args.initialState) return args.initialState;
  if (args.actions[0]?.type === "MARKET::createMarket") return null;
  return args.loadDeployedState();
}
