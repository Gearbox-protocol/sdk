import type { Address } from "viem";
import type {
  MarketCreditManagerState,
  MarketState,
} from "../../market-state/types.js";

export function updateCreditManagerState(args: {
  state: MarketState;
  creditManager: Address;
  update: (state: MarketCreditManagerState) => MarketCreditManagerState;
}): MarketState {
  const { state, creditManager, update } = args;
  const cmAddress = creditManager.toLowerCase() as Address;

  if (!state.creditManagers[cmAddress]) {
    throw new Error(`Credit manager ${cmAddress} not found`);
  }

  const cm = state.creditManagers[cmAddress];

  return {
    ...state,
    creditManagers: {
      ...state.creditManagers,
      [cmAddress]: update(cm),
    },
  };
}
