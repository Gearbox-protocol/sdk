import { type Address, zeroAddress } from "viem";
import { Addresses } from "../../deployment/addresses.js";
import type { CreateCreditSuiteAction } from "../actions/createCreditSuiteActionData.js";
import {
  BUNDLE_TARGET,
  type CreditManagerTarget,
  creditSuiteRef,
  normalizeBundleTarget,
  retargetCreditManager,
} from "../actions/creditManagerTargets.js";
import type { GipMarketAction, MarketActions } from "../actions/types.js";
import { addMarketAction } from "../editing/addAction.js";
import type { GipRegistry } from "../GipRegistry.js";
import type { MarketState } from "../state/market/types.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import type { Bundle } from "./Bundle.js";

export function isZeroFeed(feed: Address): boolean {
  return [
    Addresses.ZERO_PRICE_FEED.toLowerCase(),
    "0xfe1ec406d777b0c4e2bf5e12d0f645721b2b86be",
  ].includes(feed.toLowerCase());
}

/**
 * What a bundle action amounts to on this market, or `undefined` when the
 * market already satisfies it.
 *
 * Bundles are authored for an empty market. Applied to an existing one they
 * must not re-add assets, downgrade a limit or overwrite a working price feed,
 * and the underlying is never a quoted asset or an added collateral.
 **/
function adaptToMarket(
  action: MarketActions,
  state: MarketState,
): MarketActions | undefined {
  const isUnderlying = (token: Address) =>
    isSameAddress(token, state.underlyingAsset);

  switch (action.type) {
    case "MARKET::addAsset": {
      const token = lowerAddress(action.params.token);
      if (isUnderlying(token)) return undefined;
      const asset = state.assets[token];
      if (!asset) return action;
      // The asset is already quoted: only a placeholder feed is upgraded.
      return isZeroFeed(asset.mainPriceFeed) &&
        !isZeroFeed(action.params.priceFeed)
        ? {
            type: "ORACLE::setPriceFeed",
            params: {
              token,
              priceFeed: lowerAddress(action.params.priceFeed),
            },
          }
        : undefined;
    }
    case "ORACLE::setReservePriceFeed": {
      const token = lowerAddress(action.params.token);
      if (isUnderlying(token)) return undefined;
      const asset = state.assets[token];
      if (!asset) return action;
      const reserve = lowerAddress(asset.reservePriceFeed);
      const hasReserve = reserve !== zeroAddress && !isZeroFeed(reserve);
      return hasReserve || isZeroFeed(action.params.priceFeed)
        ? undefined
        : action;
    }
    case "POOL::setTokenLimit": {
      const token = lowerAddress(action.params.token);
      if (isUnderlying(token)) return undefined;
      const asset = state.assets[token];
      // A larger limit already in place is preserved.
      return asset && asset.quotaLimit > Number(action.params.limit)
        ? {
            type: "POOL::setTokenLimit",
            params: { token: action.params.token, limit: asset.quotaLimit },
          }
        : action;
    }
    case "CREDIT::addCollateralToken":
      return isUnderlying(action.params.token) ? undefined : action;
    default:
      return action;
  }
}

/**
 * Id a bundle's own credit suite is referred to by: stable for the bundle and
 * its salt, so applying the same bundle again merges into the same suite.
 **/
export function bundleSuiteId(
  bundle: Pick<Bundle, "name">,
  suite: CreateCreditSuiteAction,
): string {
  return suite.params.salt === undefined
    ? `bundle:${bundle.name}`
    : `bundle:${bundle.name}:${suite.params.salt}`;
}

/** The bundle's actions, with catalog zero-address placeholders normalized. **/
export function bundleActions(
  bundle: Pick<Bundle, "actions">,
): MarketActions[] {
  return bundle.actions.map(action => normalizeBundleTarget(action));
}

/** Whether the bundle names its credit manager by placeholder. **/
export function usesBundleTarget(bundle: Pick<Bundle, "actions">): boolean {
  return bundleActions(bundle).some(
    action =>
      (action.params as { creditManager?: unknown }).creditManager ===
      BUNDLE_TARGET,
  );
}

/**
 * The bundle's actions with its placeholder bound to `target`, or — when no
 * target is given and the bundle deploys exactly one credit suite — to that
 * suite, which then gets an id (see {@link bundleSuiteId}).
 *
 * Without either, the placeholder stays unbound and executing the actions
 * reports it.
 **/
export function bindBundleTarget(
  bundle: Pick<Bundle, "name" | "actions">,
  target?: CreditManagerTarget,
): MarketActions[] {
  const actions = bundleActions(bundle);
  if (target !== undefined) {
    return actions.map(action =>
      retargetCreditManager(action, BUNDLE_TARGET, target),
    );
  }
  const suites = actions.filter(
    (action): action is CreateCreditSuiteAction =>
      action.type === "MARKET::createCreditSuite",
  );
  if (suites.length !== 1) return actions;
  const [suite] = suites;
  const id = suite.params.id ?? bundleSuiteId(bundle, suite);
  return actions.map(action =>
    action === suite
      ? { ...suite, params: { ...suite.params, id } }
      : retargetCreditManager(action, BUNDLE_TARGET, creditSuiteRef(id)),
  );
}

/**
 * Merges a bundle into `actions` with {@link addMarketAction}, after adapting
 * each bundle action to the market's `currentState`.
 *
 * The bundle's placeholder is bound with {@link bindBundleTarget}: to
 * `targetCmAddress` when given, otherwise to the credit suite the bundle
 * deploys.
 **/
export function applyBundle<A extends GipMarketAction = MarketActions>(args: {
  actions: readonly A[];
  currentState: MarketState;
  bundle: Bundle;
  targetCmAddress?: CreditManagerTarget;
  /** Definitions of the recorded actions' types; built-in by default. **/
  registry?: GipRegistry;
}): (A | MarketActions)[] {
  const { actions, currentState, bundle, targetCmAddress, registry } = args;
  return bindBundleTarget(bundle, targetCmAddress).reduce<
    (A | MarketActions)[]
  >(
    (updated, bundleAction) => {
      const action = adaptToMarket(bundleAction, currentState);
      return action ? addMarketAction(updated, action, registry) : updated;
    },
    [...actions],
  );
}
