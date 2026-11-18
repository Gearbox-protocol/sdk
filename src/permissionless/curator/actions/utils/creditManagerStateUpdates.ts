import type { Address } from "viem";
import type {
  CollateralToken,
  MarketCreditManagerState,
  MarketState,
} from "../../state/market/types.js";
import { lowerAddress } from "../../utils/addressUtils.js";

/** Replaces one credit manager of the market; throws when it is unknown. **/
export function updateCreditManagerState(args: {
  state: MarketState;
  creditManager: Address;
  update: (state: MarketCreditManagerState) => MarketCreditManagerState;
}): MarketState {
  const { state, creditManager, update } = args;
  const cmAddress = lowerAddress(creditManager);
  const cm = state.creditManagers[cmAddress];
  if (!cm) throw new Error(`Credit manager ${cmAddress} not found`);

  return {
    ...state,
    creditManagers: {
      ...state.creditManagers,
      [cmAddress]: update(cm),
    },
  };
}

/**
 * Replaces one collateral token of a credit manager.
 *
 * The token has to be a market asset and already be collateral of the credit
 * manager; use `CREDIT::addCollateralToken` to introduce a new one.
 **/
export function updateCollateralToken(args: {
  state: MarketState;
  creditManager: Address;
  token: Address;
  update: (token: CollateralToken) => CollateralToken;
}): MarketState {
  const { state, creditManager, update } = args;
  const tokenAddress = lowerAddress(args.token);

  if (!state.assets[tokenAddress]) {
    throw new Error("Asset does not exist");
  }

  return updateCreditManagerState({
    state,
    creditManager,
    update: cm => {
      const collateralToken = cm.collateralTokens[tokenAddress];
      if (!collateralToken) {
        throw new Error("Token is not a collateral token");
      }

      return {
        ...cm,
        collateralTokens: {
          ...cm.collateralTokens,
          [tokenAddress]: update(collateralToken),
        },
      };
    },
  });
}
