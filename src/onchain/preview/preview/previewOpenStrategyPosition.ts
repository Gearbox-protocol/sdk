import {
  asEstimated,
  type MalformedTransactionError,
  type OpenStrategyPositionPreview,
  type PreviewOperationInput,
  type SDKReturn,
  sdkOk,
  type UnpriceableTokenError,
} from "../../../model/index.js";
import { AP_WETH_TOKEN, NO_VERSION } from "../../constants/address-provider.js";
import type { AddressMap, Asset, OnchainSDK, PluginsMap } from "../../index.js";
import type {
  InnerOperation,
  MulticallOperation,
  OpenCreditAccountOperation,
  RWAMulticallOperation,
  RWAOpenCreditAccountOperation,
} from "../parse/index.js";
import type { ReplayMulticallResult } from "./replayMulticall.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

type OpenPreviewOperation =
  | OpenCreditAccountOperation
  | RWAOpenCreditAccountOperation
  | MulticallOperation
  | RWAMulticallOperation;

export function previewOpenStrategyPosition<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  input: PreviewOperationInput,
  operation: OpenPreviewOperation,
  replay: ReplayMulticallResult,
): SDKReturn<OpenStrategyPositionPreview, MalformedTransactionError> {
  const { value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );
  const oracle = market.priceOracle;

  const { before, after } = replay;
  const account = after.account;

  // Collateral value is computed before unwrapping since the oracle cannot
  // price the native token. Best-effort: tokens the oracle cannot price
  // contribute nothing.
  //
  // `before.balances` is empty on a fresh opening and
  // leftover non-dust collateral on a reopening of a zero-debt account.
  let warning: UnpriceableTokenError | undefined;
  const price = (token: Asset["token"], balance: bigint): bigint => {
    const priced = oracle.safeConvert(token, market.underlying, balance);
    warning ??= priced.error;
    return priced.value;
  };
  // The account's own funds: what the wallet put up, less what the same
  // multicall hands back to it. A leveraged opening keeps everything it
  // bought and withdraws nothing, so the subtrahend is zero there; a borrow
  // pays the loan out on the way, and what backs the debt afterwards is the
  // collateral alone.
  const netValue =
    before.balances.sum(price) +
    after.collateralAdded.sum(price) -
    after.collateralWithdrawn.sum(price);
  const unwrapped = unwrapNativeCollateral(
    after.collateralAdded.toAssets(),
    value,
    sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
  );
  if (!unwrapped.ok) {
    return unwrapped;
  }
  const collateral = unwrapped.data;

  // `toSnapshot` filters out dust, including the 1-wei leftovers of drained
  // inputs and intermediate tokens, and on opening the folded quotas are the
  // applied changes since the account started at zero.
  const snap = account.toSnapshot(netValue + account.totalDebt);
  const targetAsset = inferTargetAsset(operation.multicall, account.balances);

  const projection = {
    // The state itself comes from the builder the intents engine reports its
    // own projections from, so an opening this module reads back and the one
    // `prepare.openNewStrategy` planned are described in one voice — `est` on
    // the fields the route decides, because the balances replayed here are the
    // floor the calls guarantee while that flow reports the branch it opens on
    // (`averageAssets`). Best-effort like the rest of the preview: tokens the
    // oracle cannot price (`unpriceableToken`) contribute nothing to the
    // metrics.
    //
    // Opening borrows the whole debt from the pool (`before.totalDebt` is 0
    // on both a fresh opening and a reopening).
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
    collateralWithdrawn: after.collateralWithdrawn
      .toAssets()
      .map(a => oracle.toTokenAmount(a.token, a.balance)),
    warning,
  };

  return sdkOk({
    ...projection,
    operation: "OpenCreditAccount",
    ...(operation.operation === "MultiCall" ||
    operation.operation === "BotMulticall" ||
    operation.operation === "RWAMulticall"
      ? { creditAccount: operation.creditAccount }
      : {}),
    ...("args" in operation ? { rwaArgs: operation.args } : {}),
  });
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
