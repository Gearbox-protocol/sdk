import {
  AP_WETH_TOKEN,
  AssetsMap,
  NO_VERSION,
  type PluginsMap,
} from "../../sdk/index.js";
import type {
  MulticallOperation,
  RWAMulticallOperation,
} from "../parse/index.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";
import {
  applyInnerOperations,
  makeInnerOperationsState,
} from "./applyInnerOperations.js";
import { applyQuotaChanges } from "./applyQuotaChanges.js";
import {
  type AdjustCreditAccountPreview,
  ERROR_UNPRICEABLE_TOKEN,
} from "./types.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

/**
 * Previews a `multicall`/`botMulticall` operation on an existing credit
 * account: fetches the account's pre-state (unless provided via options),
 * threads the multicall through {@link applyInnerOperations} and reports the
 * minimal guaranteed post-state alongside the changes relative to the
 * pre-state.
 */
export async function previewAdjustCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: MulticallOperation | RWAMulticallOperation,
  options?: PreviewOperationOptions,
): Promise<AdjustCreditAccountPreview> {
  const { sdk, value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  let ca = options?.creditAccount;
  if (!ca) {
    ca = await sdk.accounts.getCreditAccountData(
      operation.creditAccount,
      options?.blockNumber,
    );
  }
  if (!ca) {
    throw new Error(`credit account ${operation.creditAccount} not found`);
  }

  const initialBalances = new AssetsMap();
  const initialQuotas = new AssetsMap();
  for (const t of ca.tokens) {
    if (t.balance > 1n) {
      initialBalances.upsert(t.token, t.balance);
    }
    if (t.quota > 1n) {
      initialQuotas.upsert(t.token, t.quota);
    }
  }

  const state = makeInnerOperationsState();
  state.balances = initialBalances.clone();
  state.debt = ca.debt;
  state.totalDebt = ca.debt + ca.accruedInterest + ca.accruedFees;

  let error = applyInnerOperations(sdk, operation.multicall, state);

  const { assets: collateralAdded, error: unwrapError } =
    unwrapNativeCollateral(
      state.collateralAdded.toAssets(),
      value,
      sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
    );
  error ??= unwrapError;

  const { quotas, quotasChange } = applyQuotaChanges(
    initialQuotas,
    state.quotaChanges,
  );

  // On a malformed multicall the replayed balances are best-effort and may
  // be unreliable.
  const assets = state.balances.toAssets(1n);

  // `state.balances` is seeded with all initial tokens and entries are never
  // deleted, so its keys are the union of tokens present before or after
  const assetsChange = state.balances.difference(initialBalances).toAssets(1n);

  // estimated post-operation account value: minimal guaranteed assets
  // converted to underlying and summed. Best-effort: tokens the oracle
  // cannot price contribute nothing. Malformed-transaction (1xxx) errors
  // recorded above take precedence over this preview limitation (2xxx).
  const totalValue = assets.reduce((acc, { token, balance }) => {
    try {
      return (
        acc + market.priceOracle.convert(token, market.underlying, balance)
      );
    } catch {
      error ??= {
        code: ERROR_UNPRICEABLE_TOKEN,
        message: `cannot price token ${token}`,
      };
      return acc;
    }
  }, 0n);

  return {
    operation: "AdjustCreditAccount",
    creditManager: operation.creditManager,
    creditAccount: operation.creditAccount,
    collateralAdded,
    collateralWithdrawn: state.collateralWithdrawn.toAssets(),
    totalValue,
    debt: state.debt,
    debtChange: state.debt - ca.debt,
    quotas,
    quotasChange,
    assets,
    assetsChange,
    error,
  };
}
