import type { Address } from "viem";
import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../../../model/index.js";
import {
  type CreditAccountNotFoundError,
  creditAccountNotFound,
  type InstantStrategyPositionOperationPreview,
  type InvalidDelayedIntentError,
  type MalformedTransactionError,
  type PoolOperationPreviewError,
  type SDKReturn,
  sdkErr,
  sdkOk,
  type UnsupportedOperationError,
  type UnsupportedPoolFunctionError,
  type UnsupportedTargetError,
  type UnsupportedZapperFunctionError,
} from "../../../model/index.js";
import type { CreditAccountData, OnchainSDK, PluginsMap } from "../../index.js";
import {
  type InnerOperation,
  isPoolOperation,
  type MulticallOperation,
  parseOperationCalldata,
  type RWAMulticallOperation,
} from "../parse/index.js";
import { aaveMoveStart } from "./aaveMoveStart.js";
import { buildDelayedStrategyPositionOperationPreview } from "./buildDelayedStrategyPositionOperationPreview.js";
import { isCloseOrRepay } from "./detectCloseOrRepay.js";
import { resolveDelayedClaimIntent } from "./detectDelayedClaim.js";
import { detectDelayedOperation } from "./detectDelayedOperation.js";
import { estimateClaimableAt } from "./estimateClaimableAt.js";
import { loadAdapterReplayState } from "./loadAdapterReplayState.js";
import { previewAdjustStrategyPosition } from "./previewAdjustStrategyPosition.js";
import { previewExitOrRepayStrategyPosition } from "./previewExitOrRepayStrategyPosition.js";
import { previewOpenStrategyPosition } from "./previewOpenStrategyPosition.js";
import { previewPoolPositionOperation } from "./previewPoolPositionOperation.js";
import {
  type ReplayMulticallResult,
  replayMulticall,
} from "./replayMulticall.js";

/**
 * Everything {@link previewOperation} can refuse with: the refusal errors
 * its pipeline raises, discriminated by `code`. Each is a plain object —
 * never a thrown `Error` — per the SDK's refusal vocabulary.
 */
export type PreviewOperationError =
  | UnsupportedTargetError
  | UnsupportedPoolFunctionError
  | UnsupportedZapperFunctionError
  | UnsupportedOperationError
  | InvalidDelayedIntentError
  | PoolOperationPreviewError
  | MalformedTransactionError
  | CreditAccountNotFoundError;

/**
 * Previews a raw operation calldata: decodes it into a typed operation and
 * assembles an operation-specific, human-displayable preview.
 *
 * Answers an {@link SDKReturn} envelope: the preview behind `ok: true`, or —
 * when the transaction is one the previewer refuses to read — a
 * {@link PreviewOperationError} behind `ok: false`. A thrown exception
 * still means the SDK could not do its job (a read failed), not a refusal
 * of the transaction.
 *
 * `input.chainId` and `sdk` both name the chain; the engine does not read
 * `input.chainId`.
 */
export async function previewOperation<P extends PluginsMap = PluginsMap>(
  sdk: OnchainSDK<P>,
  input: PreviewOperationInput,
  options?: PreviewOperationOptions,
  creditAccount?: CreditAccountData,
): Promise<SDKReturn<OperationPreview, PreviewOperationError>> {
  const parsed = parseOperationCalldata(sdk, input);
  if (!parsed.ok) {
    return parsed;
  }
  const operation = parsed.data;

  if (isPoolOperation(operation)) {
    return previewPoolPositionOperation(sdk, operation, options);
  }

  if ("multicall" in operation) {
    await loadAdapterReplayState(sdk, operation.multicall);
  }

  if (
    operation.operation === "OpenCreditAccount" ||
    operation.operation === "RWAOpenCreditAccount"
  ) {
    const replayed = replayMulticall(sdk, beforeAaveMove(sdk, operation));
    if (!replayed.ok) {
      return replayed;
    }
    return previewOpenStrategyPosition(sdk, input, operation, replayed.data);
  }

  if (operation.operation === "CloseCreditAccount") {
    const resolved = await resolveCreditAccount(
      sdk,
      operation.creditAccount,
      options,
      creditAccount,
    );
    if (!resolved.ok) {
      return resolved;
    }
    const replayed = replayMulticall(sdk, operation, resolved.data);
    if (!replayed.ok) {
      return replayed;
    }
    const preview = previewExitOrRepayStrategyPosition(
      sdk,
      input,
      operation,
      true,
      replayed.data,
    );
    if (!preview.ok) {
      return preview;
    }
    const intent = await resolveDelayedClaimIntent(
      sdk,
      operation.multicall,
      options?.blockNumber,
    );
    if (!intent.ok) {
      return intent;
    }
    preview.data.intent = intent.data;

    return preview;
  }

  if (
    operation.operation === "MultiCall" ||
    operation.operation === "BotMulticall" ||
    operation.operation === "RWAMulticall"
  ) {
    const resolved = await resolveCreditAccount(
      sdk,
      operation.creditAccount,
      options,
      creditAccount,
    );
    if (!resolved.ok) {
      return resolved;
    }
    const replayed = replayMulticall(sdk, operation, resolved.data);
    if (!replayed.ok) {
      return replayed;
    }
    return previewMulticallOperation(
      sdk,
      input,
      operation,
      replayed.data,
      options?.blockNumber,
      resolved.data,
    );
  }

  return sdkErr({
    code: "unsupportedOperation",
    message: `operation "${operation.operation}" is not supported by previewOperation`,
    operation: operation.operation,
  } satisfies UnsupportedOperationError);
}

/**
 * The operation cut where its move to Aave Horizon begins, see
 * {@link aaveMoveStart}: an opening preview describes the account before it
 * moves. The operation itself when it does not move.
 */
function beforeAaveMove<
  P extends PluginsMap,
  O extends { multicall: InnerOperation[] },
>(sdk: OnchainSDK<P>, operation: O): O {
  const start = aaveMoveStart(sdk, operation.multicall);
  return start === undefined
    ? operation
    : { ...operation, multicall: operation.multicall.slice(0, start) };
}

/**
 * Resolves the pre-state of the credit account an operation targets: uses the
 * injected state when present, otherwise fetches it from the credit account
 * compressor.
 */
async function resolveCreditAccount<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  address: Address,
  options?: PreviewOperationOptions,
  data?: CreditAccountData,
): Promise<SDKReturn<CreditAccountData, CreditAccountNotFoundError>> {
  let resolved = data;
  if (!resolved) {
    resolved = await sdk.accounts.getCreditAccountData(
      address,
      options?.blockNumber,
    );
  }
  if (!resolved) {
    return sdkErr(creditAccountNotFound(address));
  }
  return sdkOk(resolved);
}

/**
 * Previews a plain/bot/RWA multicall: classifies the instant preview
 * (reopening a zero-debt account, zero-debt closure/repay, or adjustment)
 * and, when the multicall requests a delayed withdrawal, wraps the instant
 * preview into a `DelayedCreditAccountOperation` together with the
 * best-effort preview of the state after the withdrawal is claimed.
 *
 * A reopening is reported as `OpenCreditAccount` and never as a delayed
 * withdrawal: an opening requests no redemption. A multicall that borrows on
 * an empty account and does request one — the exit from Aave Horizon, which
 * borrows to bring the position back and redeems it at once — is a delayed
 * operation instead. A reopening that moves to Aave in the same multicall
 * ends owing nothing, and is told apart by the move itself.
 */
async function previewMulticallOperation<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  input: PreviewOperationInput,
  operation: MulticallOperation | RWAMulticallOperation,
  replay: ReplayMulticallResult,
  blockNumber: bigint | undefined,
  creditAccount: CreditAccountData,
): Promise<SDKReturn<OperationPreview, PreviewOperationError>> {
  const detected = detectDelayedOperation(sdk, operation.multicall);
  if (!detected.ok) {
    return detected;
  }
  const delayed = detected.data;

  const startsEmpty =
    !delayed &&
    replay.before.totalDebt === 0n &&
    replay.before.quotas.toAssets(0n).length === 0;

  if (startsEmpty && aaveMoveStart(sdk, operation.multicall) !== undefined) {
    const halfway = replayMulticall(
      sdk,
      beforeAaveMove(sdk, operation),
      creditAccount,
    );
    if (!halfway.ok) {
      return halfway;
    }
    return previewOpenStrategyPosition(sdk, input, operation, halfway.data);
  }

  if (startsEmpty && replay.after.account.totalDebt > 0n) {
    return previewOpenStrategyPosition(sdk, input, operation, replay);
  }

  // A multicall that fully repays the debt (`decreaseDebt(MAX)`) is a
  // zero-debt closure/repay: the account stays open but debt is cleared.
  let instantPreview: InstantStrategyPositionOperationPreview;
  if (isCloseOrRepay(operation.multicall)) {
    const instant = previewExitOrRepayStrategyPosition(
      sdk,
      input,
      operation,
      false,
      replay,
    );
    if (!instant.ok) {
      return instant;
    }
    instantPreview = instant.data;
  } else {
    const instant = previewAdjustStrategyPosition(
      sdk,
      input,
      operation,
      replay,
    );
    if (!instant.ok) {
      return instant;
    }
    instantPreview = instant.data;
  }

  if (!delayed) {
    // Not a delayed-withdrawal request; it may still be the claim ("tail")
    // part of a previously requested delayed withdrawal, in which case the
    // recorded intent is surfaced on the instant preview
    const intent = await resolveDelayedClaimIntent(
      sdk,
      operation.multicall,
      blockNumber,
    );
    if (!intent.ok) {
      return intent;
    }
    instantPreview.intent = intent.data;
    return sdkOk(instantPreview);
  }

  const { before, after } = replay;

  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );
  // The CLOSE_ACCOUNT resume unwraps the RWA underlying before withdrawing
  // it, so the user receives the vault asset, not the underlying itself
  const meta = sdk.tokensMeta.get(market.underlying);
  const receivedToken =
    meta && sdk.tokensMeta.isRWAUnderlying(meta)
      ? meta.asset
      : market.underlying;

  const suite = sdk.marketRegister.findCreditManager(operation.creditManager);

  return sdkOk({
    operation: "DelayedCreditAccountOperation",
    creditAccount: operation.creditAccount,
    ...suite.creditOperationMarket(),
    name: suite.accountStrategyName(operation.creditAccount),
    targetCollateral: suite.accountTargetCollateral(operation.creditAccount),
    intent: delayed.intent,
    estClaimableAt: estimateClaimableAt(sdk, delayed.request.phantomToken),
    instantPreview,
    delayedPreview: buildDelayedStrategyPositionOperationPreview(
      after.account,
      before,
      delayed,
      receivedToken,
      sdk,
    ),
  });
}
