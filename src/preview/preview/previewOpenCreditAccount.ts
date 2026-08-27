import {
  ERROR_UNPRICEABLE_TOKEN,
  type OpenCreditAccountPreview,
  type OperationPreviewError,
} from "../../model/index.js";
import {
  type AddressMap,
  AP_WETH_TOKEN,
  type Asset,
  calcPositionLeverage,
  DUST_THRESHOLD,
  NO_VERSION,
  type PluginsMap,
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

export async function previewOpenCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: OpenCreditAccountOperation | RWAOpenCreditAccountOperation,
): Promise<OpenCreditAccountPreview> {
  const { sdk, value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );
  const oracle = market.priceOracle;

  // Since we open an account, initial balances, debt and quotas are all zero.
  const state = makeReplayState(
    CreditAccountState.beforeOpen(operation.creditManager, market.underlying),
  );
  let error = await replayInnerOperations(sdk, operation.multicall, state);
  const account = state.account;

  // collateral value is computed before unwrapping since the oracle cannot
  // price the native token. Best-effort: tokens the oracle cannot price
  // contribute nothing.
  let priceError: OperationPreviewError | undefined;
  const collateralValue = state.collateralAdded.sum((token, balance) => {
    try {
      return oracle.convert(token, market.underlying, balance);
    } catch {
      priceError ??= {
        code: ERROR_UNPRICEABLE_TOKEN,
        message: `cannot price token ${token}`,
      };
      return 0n;
    }
  });
  const { assets: collateral, error: unwrapError } = unwrapNativeCollateral(
    state.collateralAdded.toAssets(),
    value,
    sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
  );
  error ??= unwrapError ?? priceError;

  // filter out dust, including the 1-wei leftovers of drained inputs and
  // intermediate tokens. On a malformed multicall the replayed balances are
  // best-effort and may be unreliable.
  const assets = account.balances.toAssets(DUST_THRESHOLD);
  // On opening, initial quotas are zero, so the folded quotas are the
  // applied changes.
  const quotas = account.quotas.toAssets(0n);
  const totalValue = collateralValue + account.totalDebt;
  const snap = account.toSnapshot(totalValue);
  const targetAsset = inferTargetAsset(operation.multicall, account.balances);

  return {
    operation: operation.operation,
    creditManager: operation.creditManager,
    name: sdk.marketRegister.findCreditManager(operation.creditManager).name,
    target: targetAsset
      ? oracle.toTokenAmount(targetAsset.token, targetAsset.balance)
      : undefined,
    collateral: collateral.map(a => oracle.toTokenAmount(a.token, a.balance)),
    collateralValue,
    totalValue,
    debt: account.debt,
    // WARNING: quota values are underlying-denominated
    quotas: quotas.map(q => ({
      token: sdk.tokensMeta.mustGetToken(q.token),
      ...oracle.toAmount(market.underlying, q.balance),
    })),
    assets: assets.map(a => oracle.toTokenAmount(a.token, a.balance)),
    error,
    // Best-effort like the rest of the preview: tokens the oracle cannot
    // price (ERROR_UNPRICEABLE_TOKEN) contribute nothing to the metrics.
    healthFactor: sdk.positions.healthFactor(snap),
    safeHealthFactor: sdk.positions.healthFactor(snap, { safePrices: true }),
    // opening borrows the whole debt from the pool
    borrowRate: sdk.positions.borrowRate(snap, {
      availableLiquidityChange: -account.totalDebt,
    }),
    timeToLiquidation: sdk.positions.timeToLiquidation(snap, {
      availableLiquidityChange: -account.totalDebt,
    }),
    liquidationPrice: sdk.positions.liquidationPrice(snap),
    leverage: calcPositionLeverage(totalValue, account.totalDebt),
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
