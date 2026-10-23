/** Building blocks for `MarketActionDefinition.check`. **/
import type { Address } from "viem";
import { convertPercent } from "../../../utils/format.js";
import type {
  CollateralToken,
  MarketAsset,
  MarketCreditManagerState,
  MarketState,
} from "../../state/market/types.js";
import { isSameAddress, lowerAddress } from "../../utils/addressUtils.js";
import {
  type ActionDiagnostic,
  type ActionDiagnosticPath,
  actionError,
} from "../actionDiagnostics.js";

const CREDIT_MANAGER_PATH = ["params", "creditManager"] as const;
const TOKEN_PATH = ["params", "token"] as const;

export function findCreditManager(
  state: MarketState,
  creditManager: Address,
): MarketCreditManagerState | undefined {
  return state.creditManagers[lowerAddress(creditManager)];
}

export function creditManagerNotFound(
  creditManager: Address,
): ActionDiagnostic {
  return actionError(
    "CREDIT_MANAGER_NOT_FOUND",
    `Credit manager ${creditManager} is not part of the market`,
    CREDIT_MANAGER_PATH,
  );
}

export function findAsset(
  state: MarketState,
  token: Address,
): MarketAsset | undefined {
  return state.assets[lowerAddress(token)];
}

export function assetNotFound(
  token: Address,
  path: ActionDiagnosticPath = TOKEN_PATH,
): ActionDiagnostic {
  return actionError(
    "ASSET_NOT_FOUND",
    `Token ${token} is not a quoted asset of the market`,
    path,
  );
}

export function isUnderlying(state: MarketState, token: Address): boolean {
  return isSameAddress(token, state.underlyingAsset);
}

export function underlyingNotAllowed(
  path: ActionDiagnosticPath = TOKEN_PATH,
): ActionDiagnostic {
  return actionError(
    "UNDERLYING_NOT_ALLOWED",
    "The action cannot target the market's underlying",
    path,
  );
}

export function findCollateral(
  cm: MarketCreditManagerState,
  token: Address,
): CollateralToken | undefined {
  return cm.collateralTokens[lowerAddress(token)];
}

export function collateralNotFound(token: Address): ActionDiagnostic {
  return actionError(
    "COLLATERAL_NOT_FOUND",
    `Token ${token} is not collateral of the credit manager`,
    TOKEN_PATH,
  );
}

/** The underlying's liquidation threshold, in basis points. **/
export function underlyingLtBps(
  state: MarketState,
  cm: MarketCreditManagerState,
): number | undefined {
  const lt = findCollateral(
    cm,
    state.underlyingAsset,
  )?.liquidationThresholdFinal;
  return lt === undefined ? undefined : convertPercent(lt);
}

/**
 * `CreditConfiguratorV3` rejects a liquidation threshold above the
 * underlying's (`IncorrectLiquidationThresholdException`).
 **/
export function liquidationThresholdDiagnostics(
  state: MarketState,
  cm: MarketCreditManagerState,
  liquidationThreshold: number,
  path: ActionDiagnosticPath,
): ActionDiagnostic[] {
  const max = underlyingLtBps(state, cm);
  if (max === undefined || convertPercent(liquidationThreshold) <= max)
    return [];
  return [
    actionError(
      "LT_ABOVE_UNDERLYING",
      `Liquidation threshold ${liquidationThreshold}% exceeds the underlying's ${max / 100}%`,
      path,
    ),
  ];
}

/**
 * The action would change nothing. Contracts either skip such a call or
 * revert on it; either way it does not belong in a GIP.
 **/
export function noOp(
  message: string,
  path?: ActionDiagnosticPath,
): ActionDiagnostic {
  return actionError("NO_OP", message, path);
}

export function tokenNotQuoted(token: Address): ActionDiagnostic {
  return actionError(
    "TOKEN_NOT_QUOTED",
    `Token ${token} has no quota rate in the market's rate keeper`,
    TOKEN_PATH,
  );
}

export function rateKeeperMismatch(
  expected: string,
  actual: string,
): ActionDiagnostic {
  return actionError(
    "RATE_KEEPER_MISMATCH",
    `The action needs a ${expected} rate keeper, the market has ${actual}`,
  );
}

export function lossPolicyMismatch(
  expected: string,
  actual: string,
): ActionDiagnostic {
  return actionError(
    "LOSS_POLICY_MISMATCH",
    `The action needs a ${expected} loss policy, the market has ${actual}`,
  );
}
