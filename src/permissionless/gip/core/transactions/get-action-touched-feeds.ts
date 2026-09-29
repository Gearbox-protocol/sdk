import type { Address } from "viem";
import type { MarketActions } from "../actions/index.js";
import type { MarketState } from "../market-state/types.js";

export function getActionTouchedFeeds(args: {
  action: MarketActions;
  afterState: MarketState;
}): Address | undefined {
  const { action, afterState } = args;
  switch (action.type) {
    case "MARKET::createMarket":
      return action.params.underlyingPriceFeed;
    case "MARKET::addAsset":
      return action.params.priceFeed;
    case "ORACLE::setPriceFeed":
      return action.params.priceFeed;
    case "ORACLE::setReservePriceFeed":
      return action.params.priceFeed;
    case "POOL::setTokenLimit":
      return afterState.assets[action.params.token.toLowerCase() as Address]
        ?.mainPriceFeed;
    case "MARKET::createCreditSuite":
      return afterState.underlyingPriceFeed;
    case "LOSS_POLICY::ALIAS::setAlias":
      return action.params.alias;
    default:
      return undefined;
  }
}
