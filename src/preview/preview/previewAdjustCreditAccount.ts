import { AP_WETH_TOKEN, NO_VERSION, type PluginsMap } from "../../sdk/index.js";
import type {
  MulticallOperation,
  RWAMulticallOperation,
} from "../parse/index.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";
import { replayMulticall } from "./replayMulticall.js";
import {
  type AdjustCreditAccountPreview,
  ERROR_UNPRICEABLE_TOKEN,
  PREVIEW_DUST,
} from "./types.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

/**
 * Previews a `multicall`/`botMulticall` operation on an existing credit
 * account: threads the multicall through {@link replayMulticall} over the
 * pre-resolved account state (`options.creditAccount`) and reports the
 * minimal guaranteed post-state alongside the changes relative to the
 * pre-state.
 */
export async function previewAdjustCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: MulticallOperation | RWAMulticallOperation,
  options: PreviewOperationOptions<true>,
): Promise<AdjustCreditAccountPreview> {
  const { sdk, value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  const {
    before,
    after,
    error: replayError,
  } = await replayMulticall(sdk, operation, options);
  const account = after.account;
  let error = replayError;

  const { assets: collateralAdded, error: unwrapError } =
    unwrapNativeCollateral(
      after.collateralAdded.toAssets(),
      value,
      sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
    );
  error ??= unwrapError;

  // On a malformed multicall the replayed balances are best-effort and may
  // be unreliable.
  const assets = account.balances.toAssets(PREVIEW_DUST);

  // The replayed state is seeded with all initial tokens and entries are
  // never deleted, so its keys are the union of tokens present before or
  // after
  const assetsChange = account.balances
    .difference(before.balances)
    .toAssets(PREVIEW_DUST);

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
    collateralWithdrawn: after.collateralWithdrawn.toAssets(),
    totalValue,
    debt: account.debt,
    debtChange: account.debt - before.debt,
    quotas: account.quotas.toAssets(0n),
    quotasChange: account.quotas.difference(before.quotas).toAssets(),
    assets,
    assetsChange,
    error,
  };
}
