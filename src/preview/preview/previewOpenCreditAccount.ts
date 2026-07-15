import {
  type AddressMap,
  AP_WETH_TOKEN,
  type Asset,
  NO_VERSION,
  type PluginsMap,
} from "../../sdk/index.js";
import type {
  InnerOperation,
  OpenCreditAccountOperation,
  RWAOpenCreditAccountOperation,
} from "../parse/index.js";
import type { PreviewOperationInput } from "../types.js";
import {
  applyInnerOperations,
  makeInnerOperationsState,
} from "./applyInnerOperations.js";
import {
  ERROR_UNPRICEABLE_TOKEN,
  type OpenCreditAccountPreview,
  type OperationPreviewError,
} from "./types.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

export async function previewOpenCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: OpenCreditAccountOperation | RWAOpenCreditAccountOperation,
): Promise<OpenCreditAccountPreview> {
  const { sdk, value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  // Since we open an account, initial balances, debt and quotas are all zero.
  const state = makeInnerOperationsState();
  let error = await applyInnerOperations(sdk, operation.multicall, state);

  // collateral value is computed before unwrapping since the oracle cannot
  // price the native token. Best-effort: tokens the oracle cannot price
  // contribute nothing.
  let priceError: OperationPreviewError | undefined;
  const collateralValue = state.collateralAdded.sum((token, balance) => {
    try {
      return market.priceOracle.convert(token, market.underlying, balance);
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
  const assets = state.balances.toAssets(1n);

  return {
    operation: operation.operation,
    creditManager: operation.creditManager,
    target: inferTargetAsset(operation.multicall, state.balances),
    collateral,
    collateralValue,
    debt: state.debt,
    // On opening, initial quotas are zero, so the raw changes are the quotas.
    quotas: state.quotaChanges,
    assets,
    error,
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
