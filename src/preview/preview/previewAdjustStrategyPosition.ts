import {
  type AdjustStrategyPositionPreview,
  asEstimated,
  ERROR_UNPRICEABLE_TOKEN,
} from "../../model/index.js";
import {
  AP_WETH_TOKEN,
  DUST_THRESHOLD,
  NO_VERSION,
  type PluginsMap,
} from "../../onchain/index.js";
import type {
  MulticallOperation,
  RWAMulticallOperation,
} from "../parse/index.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";
import { replayMulticall } from "./replayMulticall.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

/**
 * Previews a `multicall`/`botMulticall` operation on an existing credit
 * account: threads the multicall through {@link replayMulticall} over the
 * pre-resolved account state (`options.creditAccount`) and reports the
 * minimal guaranteed post-state alongside the changes relative to the
 * pre-state.
 */
export function previewAdjustStrategyPosition<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: MulticallOperation | RWAMulticallOperation,
  options: PreviewOperationOptions<true>,
): AdjustStrategyPositionPreview {
  const { sdk, value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );
  const oracle = market.priceOracle;

  const {
    before,
    after,
    error: replayError,
  } = replayMulticall(sdk, operation, options);
  const account = after.account;
  let error = replayError;

  const { assets: collateralAdded, error: unwrapError } =
    unwrapNativeCollateral(
      after.collateralAdded.toAssets(),
      value,
      sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
    );
  error ??= unwrapError;

  // The replayed state is seeded with all initial tokens and entries are
  // never deleted, so its keys are the union of tokens present before or
  // after
  const assetsChange = account.balances
    .difference(before.balances)
    .toAssets(DUST_THRESHOLD);

  // estimated post-operation account value: minimal guaranteed assets
  // converted to underlying and summed. Best-effort: tokens the oracle
  // cannot price contribute nothing. Malformed-transaction (1xxx) errors
  // recorded above take precedence over this preview limitation (2xxx).
  //
  // On a malformed multicall the replayed balances the sum is taken over are
  // best-effort and may be unreliable.
  const totalValue = account.balances
    .toAssets(DUST_THRESHOLD)
    .reduce((acc, { token, balance }) => {
      try {
        return acc + oracle.convert(token, market.underlying, balance);
      } catch {
        error ??= {
          code: ERROR_UNPRICEABLE_TOKEN,
          message: `cannot price token ${token}`,
        };
        return acc;
      }
    }, 0n);
  const snap = account.toSnapshot(totalValue);

  return {
    operation: "AdjustCreditAccount",
    // The state itself comes from the builder the intents engine reports its
    // own projections from, so a transaction this module reads back and the
    // request that produced it are described in one voice — `est` on the fields
    // a swap decides, because what the calls guarantee is a floor and what the
    // engine planned against was the amount the route expects to return.
    // Best-effort like the rest of the preview: tokens the oracle cannot price
    // (ERROR_UNPRICEABLE_TOKEN) contribute nothing to the metrics.
    //
    // Debt taken on leaves the pool, debt repaid returns to it.
    ...asEstimated(
      sdk.positions.projection(snap, {
        availableLiquidityChange: before.totalDebt - account.totalDebt,
      }),
    ),
    creditAccount: operation.creditAccount,
    collateralAdded: collateralAdded.map(a =>
      oracle.toTokenAmount(a.token, a.balance),
    ),
    collateralWithdrawn: after.collateralWithdrawn
      .toAssets()
      .map(a => oracle.toTokenAmount(a.token, a.balance)),
    totalDebtChange: market.toUnderlyingAmount(
      account.totalDebt - before.totalDebt,
    ),
    quotasChange: account.quotas
      .difference(before.quotas)
      .toAssets()
      .map(q => ({
        token: sdk.tokensMeta.mustGetToken(q.token),
        ...oracle.toAmount(market.underlying, q.balance),
      })),
    assetsChange: assetsChange.map(a =>
      oracle.toTokenAmount(a.token, a.balance),
    ),
    error,
  };
}
