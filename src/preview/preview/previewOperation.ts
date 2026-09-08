import type { OperationPreview } from "../../model/index.js";
import {
  type CreditAccountNotFoundError,
  creditAccountNotFound,
  type InstantStrategyPositionOperationPreview,
  type InvalidDelayedIntentError,
  isSDKError,
  type MalformedTransactionError,
  type PoolOperationPreviewError,
  type SDKReturn,
  sdkErr,
  sdkOk,
  type UnsupportedOperationError,
  type UnsupportedPoolFunctionError,
  type UnsupportedTargetError,
  type UnsupportedZapperFunctionError,
} from "../../model/index.js";
import type { PluginsMap } from "../../onchain/index.js";
import {
  isPoolOperation,
  type MulticallOperation,
  parseOperationCalldata,
  type RWAMulticallOperation,
} from "../parse/index.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";
import { buildDelayedStrategyPositionOperationPreview } from "./buildDelayedStrategyPositionOperationPreview.js";
import { isCloseOrRepay } from "./detectCloseOrRepay.js";
import { resolveDelayedClaimIntent } from "./detectDelayedClaim.js";
import { detectDelayedOperation } from "./detectDelayedOperation.js";
import { estimateClaimableAt } from "./estimateClaimableAt.js";
import { previewAdjustStrategyPosition } from "./previewAdjustStrategyPosition.js";
import { previewExitOrRepayStrategyPosition } from "./previewExitOrRepayStrategyPosition.js";
import { previewOpenStrategyPosition } from "./previewOpenStrategyPosition.js";
import { previewPoolPositionOperation } from "./previewPoolPositionOperation.js";
import {
  type ReplayableOperation,
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
 */
export async function previewOperation<P extends PluginsMap = PluginsMap>(
  input: PreviewOperationInput<P>,
  options?: PreviewOperationOptions,
): Promise<SDKReturn<OperationPreview, PreviewOperationError>> {
  const parsed = parseOperationCalldata(input);
  if (isSDKError(parsed)) {
    return parsed;
  }
  const operation = parsed.data;

  if (isPoolOperation(operation)) {
    return previewPoolPositionOperation(input, operation, options);
  }

  if (
    operation.operation === "OpenCreditAccount" ||
    operation.operation === "RWAOpenCreditAccount"
  ) {
    return previewOpenStrategyPosition(input, operation);
  }

  if (operation.operation === "CloseCreditAccount") {
    const resolved = await resolveCreditAccount(input, operation, options);
    if (isSDKError(resolved)) {
      return resolved;
    }
    const replayed = replayMulticall(input.sdk, operation, resolved.data);
    if (isSDKError(replayed)) {
      return replayed;
    }
    const preview = previewExitOrRepayStrategyPosition(
      input,
      operation,
      true,
      replayed.data,
    );
    if (isSDKError(preview)) {
      return preview;
    }
    const intent = await resolveDelayedClaimIntent(
      input.sdk,
      operation.multicall,
      options?.blockNumber,
    );
    if (isSDKError(intent)) {
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
    const resolved = await resolveCreditAccount(input, operation, options);
    if (isSDKError(resolved)) {
      return resolved;
    }
    const replayed = replayMulticall(input.sdk, operation, resolved.data);
    if (isSDKError(replayed)) {
      return replayed;
    }
    return previewMulticallOperation(
      input,
      operation,
      replayed.data,
      options?.blockNumber,
    );
  }

  return sdkErr({
    code: "unsupportedOperation",
    message: `operation "${operation.operation}" is not supported by previewOperation`,
    operation: operation.operation,
  } satisfies UnsupportedOperationError);
}

/**
 * Resolves the pre-state of the credit account an operation targets: uses the
 * state provided via options when present, otherwise fetches it from the
 * credit account compressor.
 */
async function resolveCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: ReplayableOperation,
  options?: PreviewOperationOptions,
): Promise<
  SDKReturn<PreviewOperationOptions<true>, CreditAccountNotFoundError>
> {
  let creditAccount = options?.creditAccount;
  if (!creditAccount) {
    creditAccount = await input.sdk.accounts.getCreditAccountData(
      operation.creditAccount,
      options?.blockNumber,
    );
  }
  if (!creditAccount) {
    return sdkErr(creditAccountNotFound(operation.creditAccount));
  }
  return sdkOk({ ...options, creditAccount });
}

/**
 * Previews a plain/bot/RWA multicall: classifies the instant preview
 * (zero-debt closure/repay vs adjustment) and, when the multicall requests a
 * delayed withdrawal, wraps the instant preview into a
 * `DelayedCreditAccountOperation` together with the best-effort preview of
 * the state after the withdrawal is claimed.
 */
async function previewMulticallOperation<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: MulticallOperation | RWAMulticallOperation,
  replay: ReplayMulticallResult,
  blockNumber?: bigint,
): Promise<SDKReturn<OperationPreview, PreviewOperationError>> {
  const { sdk } = input;

  // A multicall that fully repays the debt (`decreaseDebt(MAX)`) is a
  // zero-debt closure/repay: the account stays open but debt is cleared.
  let instantPreview: InstantStrategyPositionOperationPreview;
  if (isCloseOrRepay(operation.multicall)) {
    const instant = previewExitOrRepayStrategyPosition(
      input,
      operation,
      false,
      replay,
    );
    if (isSDKError(instant)) {
      return instant;
    }
    instantPreview = instant.data;
  } else {
    const instant = previewAdjustStrategyPosition(input, operation, replay);
    if (isSDKError(instant)) {
      return instant;
    }
    instantPreview = instant.data;
  }

  const detected = detectDelayedOperation(sdk, operation.multicall);
  if (isSDKError(detected)) {
    return detected;
  }
  const delayed = detected.data;
  if (!delayed) {
    // Not a delayed-withdrawal request; it may still be the claim ("tail")
    // part of a previously requested delayed withdrawal, in which case the
    // recorded intent is surfaced on the instant preview
    const intent = await resolveDelayedClaimIntent(
      sdk,
      operation.multicall,
      blockNumber,
    );
    if (isSDKError(intent)) {
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
