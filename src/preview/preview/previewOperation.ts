import type { OperationPreview } from "../../model/index.js";
import { type SDKReturn, sdkErr, sdkOk } from "../../model/index.js";
import type {
  ConvertFn,
  InvalidDelayedIntentError,
  PluginsMap,
} from "../../onchain/index.js";
import {
  isPoolOperation,
  type MulticallOperation,
  parseOperationCalldata,
  type RWAMulticallOperation,
  type UnsupportedPoolFunctionError,
  type UnsupportedTargetError,
  type UnsupportedZapperFunctionError,
} from "../parse/index.js";
import type { PreviewSimulationError } from "../simulate/errors.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";
import { buildDelayedStrategyPositionOperationPreview } from "./buildDelayedStrategyPositionOperationPreview.js";
import { isCloseOrRepay } from "./detectCloseOrRepay.js";
import { resolveDelayedClaimIntent } from "./detectDelayedClaim.js";
import { detectDelayedOperation } from "./detectDelayedOperation.js";
import {
  type UnsupportedOperationError,
  unsupportedOperation,
} from "./errors.js";
import { estimateClaimableAt } from "./estimateClaimableAt.js";
import { previewAdjustStrategyPosition } from "./previewAdjustStrategyPosition.js";
import { previewExitOrRepayStrategyPosition } from "./previewExitOrRepayStrategyPosition.js";
import { previewOpenStrategyPosition } from "./previewOpenStrategyPosition.js";
import { previewPoolPositionOperation } from "./previewPoolPositionOperation.js";
import {
  type ReplayableOperation,
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
  | PreviewSimulationError;

/**
 * Compile-total map of the refusal codes: a member added to or removed from
 * {@link PreviewOperationError} breaks the build here.
 */
const PREVIEW_OPERATION_ERROR_CODES: Record<
  PreviewOperationError["code"],
  true
> = {
  unsupportedTarget: true,
  unsupportedPoolFunction: true,
  unsupportedZapperFunction: true,
  unsupportedOperation: true,
  invalidDelayedIntent: true,
  previewSimulationFailed: true,
};

/**
 * Narrows a raised value to the refusal vocabulary: a plain non-`Error`
 * object whose `code` is one of the preview refusal codes. Genuine
 * exceptions — bugs, outages, calldata the parser cannot read at all — fail
 * the check and keep propagating as throws.
 */
export function isPreviewOperationError(
  raised: unknown,
): raised is PreviewOperationError {
  if (
    typeof raised !== "object" ||
    raised === null ||
    raised instanceof Error
  ) {
    return false;
  }
  const code = (raised as { code?: unknown }).code;
  return (
    typeof code === "string" &&
    Object.hasOwn(PREVIEW_OPERATION_ERROR_CODES, code)
  );
}

/**
 * Previews a raw operation calldata: decodes it into a typed operation and
 * assembles an operation-specific, human-displayable preview.
 *
 * Answers an {@link SDKReturn} envelope: the preview behind `ok: true`, or —
 * when the transaction is one the previewer refuses to read — a
 * {@link PreviewOperationError} behind `ok: false`. A thrown exception
 * still means the SDK could not do its job (a read failed, the targeted
 * credit account could not be resolved), not a refusal of the transaction.
 */
export async function previewOperation<P extends PluginsMap = PluginsMap>(
  input: PreviewOperationInput<P>,
  options?: PreviewOperationOptions,
): Promise<SDKReturn<OperationPreview, PreviewOperationError>> {
  try {
    const operation = parseOperationCalldata(input);

    if (isPoolOperation(operation)) {
      return sdkOk(
        await previewPoolPositionOperation(input, operation, options),
      );
    }

    if (
      operation.operation === "OpenCreditAccount" ||
      operation.operation === "RWAOpenCreditAccount"
    ) {
      return sdkOk(await previewOpenStrategyPosition(input, operation));
    }

    if (operation.operation === "CloseCreditAccount") {
      const resolved = await resolveCreditAccount(input, operation, options);
      const preview = previewExitOrRepayStrategyPosition(
        input,
        operation,
        true,
        resolved,
      );
      preview.intent = await resolveDelayedClaimIntent(
        input.sdk,
        operation.multicall,
        options?.blockNumber,
      );

      return sdkOk(preview);
    }

    if (
      operation.operation === "MultiCall" ||
      operation.operation === "BotMulticall" ||
      operation.operation === "RWAMulticall"
    ) {
      const resolved = await resolveCreditAccount(input, operation, options);
      return sdkOk(await previewMulticallOperation(input, operation, resolved));
    }

    return sdkErr(unsupportedOperation(operation.operation));
  } catch (raised) {
    if (isPreviewOperationError(raised)) {
      return sdkErr(raised);
    }
    throw raised;
  }
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
): Promise<PreviewOperationOptions<true>> {
  let creditAccount = options?.creditAccount;
  if (!creditAccount) {
    creditAccount = await input.sdk.accounts.getCreditAccountData(
      operation.creditAccount,
      options?.blockNumber,
    );
  }
  if (!creditAccount) {
    throw new Error(`credit account ${operation.creditAccount} not found`);
  }
  return { ...options, creditAccount };
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
  options: PreviewOperationOptions<true>,
): Promise<OperationPreview> {
  const { sdk } = input;

  // A multicall that fully repays the debt (`decreaseDebt(MAX)`) is a
  // zero-debt closure/repay: the account stays open but debt is cleared.
  const instantPreview = isCloseOrRepay(operation.multicall)
    ? previewExitOrRepayStrategyPosition(input, operation, false, options)
    : previewAdjustStrategyPosition(input, operation, options);

  const delayed = detectDelayedOperation(sdk, operation.multicall);
  if (!delayed) {
    // Not a delayed-withdrawal request; it may still be the claim ("tail")
    // part of a previously requested delayed withdrawal, in which case the
    // recorded intent is surfaced on the instant preview
    instantPreview.intent = await resolveDelayedClaimIntent(
      sdk,
      operation.multicall,
      options?.blockNumber,
    );
    return instantPreview;
  }

  const { before, after } = replayMulticall(sdk, operation, options);

  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );
  const convert: ConvertFn = (token, to, amount) =>
    market.priceOracle.convert(token, to, amount);

  // The CLOSE_ACCOUNT resume unwraps the RWA underlying before withdrawing
  // it, so the user receives the vault asset, not the underlying itself
  const meta = sdk.tokensMeta.get(market.underlying);
  const receivedToken =
    meta && sdk.tokensMeta.isRWAUnderlying(meta)
      ? meta.asset
      : market.underlying;

  const suite = sdk.marketRegister.findCreditManager(operation.creditManager);

  return {
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
      convert,
      receivedToken,
      sdk,
    ),
  };
}
