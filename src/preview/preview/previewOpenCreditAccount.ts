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
  SecuritizeOpenCreditAccountOperation,
} from "../parse/index.js";
import {
  applyInnerOperations,
  makeInnerOperationsState,
} from "./applyInnerOperations.js";
import type {
  OpenCreditAccountPreview,
  PreviewOperationInput,
} from "./types.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

export function previewOpenCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: OpenCreditAccountOperation | SecuritizeOpenCreditAccountOperation,
): OpenCreditAccountPreview {
  const { sdk, value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  // Since we open an account, initial balances, debt and quotas are all zero.
  const state = makeInnerOperationsState();
  applyInnerOperations(sdk, operation.multicall, state);

  // collateral value is computed before unwrapping since the oracle cannot
  // price the native token
  const collateralValue = state.collateralAdded.sum((token, balance) =>
    market.priceOracle.convert(token, market.underlying, balance),
  );
  const collateral = unwrapNativeCollateral(
    state.collateralAdded.toAssets(),
    value,
    sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
  );

  // filter out dust, including the 1-wei leftovers of drained inputs and
  // intermediate tokens
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
