import {
  asEstimated,
  type OpenStrategyPositionPreview,
  type OperationPreviewError,
} from "../../model/index.js";
import {
  type AddressMap,
  AP_WETH_TOKEN,
  type Asset,
  NO_VERSION,
  type PluginsMap,
  unpriceableTokenError,
} from "../../onchain/index.js";
import type {
  InnerOperation,
  OpenCreditAccountOperation,
  RWAOpenCreditAccountOperation,
} from "../parse/index.js";
import type { PreviewOperationInput } from "../types.js";
import { CreditAccountState } from "./CreditAccountState.js";
import {
  makeReplayState,
  replayInnerOperations,
} from "./replayInnerOperations.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

export function previewOpenStrategyPosition<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: OpenCreditAccountOperation | RWAOpenCreditAccountOperation,
): OpenStrategyPositionPreview {
  const { sdk, value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );
  const oracle = market.priceOracle;

  // Since we open an account, initial balances, debt and quotas are all zero.
  const state = makeReplayState(
    CreditAccountState.beforeOpen(operation.creditManager, market.underlying),
  );
  let warning = replayInnerOperations(sdk, operation.multicall, state);
  const account = state.account;

  // collateral value is computed before unwrapping since the oracle cannot
  // price the native token. Best-effort: tokens the oracle cannot price
  // contribute nothing.
  let priceWarning: OperationPreviewError | undefined;
  const netValue = state.collateralAdded.sum((token, balance) => {
    try {
      return oracle.convert(token, market.underlying, balance);
    } catch {
      priceWarning ??= unpriceableTokenError(token);
      return 0n;
    }
  });
  const { assets: collateral, warning: unwrapWarning } = unwrapNativeCollateral(
    state.collateralAdded.toAssets(),
    value,
    sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
  );
  warning ??= unwrapWarning ?? priceWarning;

  // `toSnapshot` filters out dust, including the 1-wei leftovers of drained
  // inputs and intermediate tokens, and on opening the folded quotas are the
  // applied changes since the account started at zero. On a malformed multicall
  // the replayed balances are best-effort and may be unreliable.
  const snap = account.toSnapshot(netValue + account.totalDebt);
  const targetAsset = inferTargetAsset(operation.multicall, account.balances);

  return {
    operation: operation.operation,
    // The state itself comes from the builder the intents engine reports its
    // own projections from, so an opening this module reads back and the one
    // `prepare.openNewStrategy` planned are described in one voice — `est` on
    // the fields the route decides, because the balances replayed here are the
    // floor the calls guarantee while that flow reports the branch it opens on
    // (`averageAssets`). Best-effort like the rest of the preview: tokens the
    // oracle cannot price (`unpriceableToken`) contribute nothing to the
    // metrics.
    //
    // Opening borrows the whole debt from the pool.
    ...asEstimated(
      sdk.positions.projection(snap, {
        availableLiquidityChange: -account.totalDebt,
      }),
    ),
    targetCollateral: targetAsset
      ? oracle.toTokenAmount(targetAsset.token, targetAsset.balance)
      : undefined,
    collateralAdded: collateral.map(a =>
      oracle.toTokenAmount(a.token, a.balance),
    ),
    warning,
  };
}

/**
 * Infers the strategy target token of an account opening: the first quoted
 * token (first `UpdateQuota` with a positive change), with its balance taken
 * from the computed assets. Returns `undefined` when nothing is quoted.
 */
function inferTargetAsset(
  multicall: InnerOperation[],
  balances: AddressMap<bigint>,
): Asset | undefined {
  for (const op of multicall) {
    if (op.operation === "UpdateQuota" && op.change > 0n) {
      const balance = balances.get(op.token);
      return balance ? { token: op.token, balance } : undefined;
    }
  }
  return undefined;
}
