import type { Address } from "viem";
import { zeroAddress } from "viem";
import { Addresses } from "../../../index.js";
import type { Bundle } from "../../bundles/types.js";
import type { MarketActions } from "../actions/index.js";
import { marketActionsReplaceCmAddress } from "../actions/index-data.js";
import { addOrReplaceAction } from "../editing/add-or-replace.js";
import type { MarketState } from "../market-state/types.js";

export function isZeroFeed(feed: Address): boolean {
  return [
    Addresses.ZERO_PRICE_FEED.toLowerCase(),
    "0xfe1ec406d777b0c4e2bf5e12d0f645721b2b86be",
  ].includes(feed.toLowerCase());
}

export function applyBundle(args: {
  actions: MarketActions[];
  currentState: MarketState;
  bundle: Bundle;
  targetCmAddress?: Address;
}): MarketActions[] {
  const { actions, currentState, bundle, targetCmAddress } = args;
  const processed = targetCmAddress
    ? bundle.actions.map(action =>
        marketActionsReplaceCmAddress({
          action,
          newCm: targetCmAddress,
          oldCm: zeroAddress,
        }),
      )
    : bundle.actions;

  let updated = actions;
  for (const action of processed) {
    switch (action.type) {
      case "MARKET::addAsset": {
        const token = action.params.token.toLowerCase() as Address;
        if (token === currentState.underlyingAsset.toLowerCase()) break;
        const asset = currentState.assets[token];
        if (asset) {
          if (
            isZeroFeed(asset.mainPriceFeed) &&
            !isZeroFeed(action.params.priceFeed)
          ) {
            updated = addOrReplaceAction(updated, {
              type: "ORACLE::setPriceFeed",
              params: {
                token,
                priceFeed: action.params.priceFeed.toLowerCase() as Address,
              },
            });
          }
          break;
        }
        updated = addOrReplaceAction(updated, action);
        break;
      }
      case "ORACLE::setReservePriceFeed": {
        const token = action.params.token.toLowerCase() as Address;
        if (token === currentState.underlyingAsset.toLowerCase()) break;
        const asset = currentState.assets[token];
        if (!asset) {
          updated = addOrReplaceAction(updated, action);
          break;
        }
        const reserve = asset.reservePriceFeed.toLowerCase() as Address;
        if (
          (reserve !== zeroAddress && !isZeroFeed(reserve)) ||
          isZeroFeed(action.params.priceFeed)
        )
          break;
        updated = addOrReplaceAction(updated, action);
        break;
      }
      case "POOL::setTokenLimit": {
        const token = action.params.token.toLowerCase() as Address;
        if (token === currentState.underlyingAsset.toLowerCase()) break;
        const asset = currentState.assets[token];
        updated = addOrReplaceAction(
          updated,
          asset && asset.quotaLimit > action.params.limit
            ? {
                type: "POOL::setTokenLimit",
                params: { token: action.params.token, limit: asset.quotaLimit },
              }
            : action,
        );
        break;
      }
      case "CREDIT::addCollateralToken": {
        if (
          action.params.token.toLowerCase() !==
          currentState.underlyingAsset.toLowerCase()
        )
          updated = addOrReplaceAction(updated, action);
        break;
      }
      default:
        updated = addOrReplaceAction(updated, action);
    }
  }
  return updated;
}
