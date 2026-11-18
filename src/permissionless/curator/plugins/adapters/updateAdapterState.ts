/**
 * State updates for adapters. Kept apart from `builtinAdapterPlugins.ts` so that the adapter
 * action processors can import it without a circular dependency.
 **/
import type { Address } from "viem";
import type { MarketState } from "../../state/market/types.js";
import { lowerAddress } from "../../utils/addressUtils.js";
import type { AdapterStateBase } from "./defineAdapterPlugin.js";

/** Replaces the state of the adapter of `target` in one credit manager. **/
export function updateAdapterState<T extends AdapterStateBase>(args: {
  state: MarketState;
  creditManager: Address;
  target: Address;
  update: (state: T) => T;
}): MarketState {
  const { state, creditManager, target, update } = args;
  const cmAddress = lowerAddress(creditManager);
  const targetAddress = lowerAddress(target);

  const cm = state.creditManagers[cmAddress];
  if (!cm) {
    throw new Error(`Credit manager ${creditManager} not found`);
  }

  const adapterState = cm.adapters[targetAddress] as unknown as T;
  if (!adapterState) {
    throw new Error(
      `AdapterState ${target} not found for credit manager ${creditManager}`,
    );
  }

  return {
    ...state,
    creditManagers: {
      ...state.creditManagers,
      [cmAddress]: {
        ...cm,
        adapters: {
          ...cm.adapters,
          [targetAddress]: update(adapterState),
        },
      },
    },
  };
}
