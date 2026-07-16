import type { PluginsMap } from "../../sdk/index.js";
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
import { buildDelayedPreview, type ConvertFn } from "./buildDelayedPreview.js";
import { isCloseOrRepay } from "./detectCloseOrRepay.js";
import { detectDelayedOperation } from "./detectDelayedOperation.js";
import { UnsupportedOperationError } from "./errors.js";
import { previewAdjustCreditAccount } from "./previewAdjustCreditAccount.js";
import { previewCloseOrRepayCreditAccount } from "./previewCloseOrRepayCreditAccount.js";
import { previewOpenCreditAccount } from "./previewOpenCreditAccount.js";
import { previewPoolOperation } from "./previewPoolOperation.js";
import {
  type ReplayableOperation,
  replayMulticall,
} from "./replayMulticall.js";
import type { OperationPreview } from "./types.js";

/**
 * Previews a raw operation calldata: decodes it into a typed operation and
 * assembles an operation-specific, human-displayable preview.
 */
export async function previewOperation<P extends PluginsMap = PluginsMap>(
  input: PreviewOperationInput<P>,
  options?: PreviewOperationOptions,
): Promise<OperationPreview> {
  const operation = parseOperationCalldata(input);

  if (isPoolOperation(operation)) {
    return previewPoolOperation(input, operation, options);
  }

  if (
    operation.operation === "OpenCreditAccount" ||
    operation.operation === "RWAOpenCreditAccount"
  ) {
    return previewOpenCreditAccount(input, operation);
  }

  if (operation.operation === "CloseCreditAccount") {
    const resolved = await resolveCreditAccount(input, operation, options);
    return previewCloseOrRepayCreditAccount(input, operation, true, resolved);
  }

  if (
    operation.operation === "MultiCall" ||
    operation.operation === "BotMulticall" ||
    operation.operation === "RWAMulticall"
  ) {
    const resolved = await resolveCreditAccount(input, operation, options);
    return previewMulticallOperation(input, operation, resolved);
  }

  throw new UnsupportedOperationError(operation.operation);
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

  // A multicall that fully repays the debt and withdraws everything is a
  // zero-debt closure/repay: the account stays open but is emptied.
  const instantPreview = isCloseOrRepay(operation.multicall)
    ? await previewCloseOrRepayCreditAccount(input, operation, false, options)
    : await previewAdjustCreditAccount(input, operation, options);

  const delayed = detectDelayedOperation(sdk, operation.multicall);
  if (!delayed) {
    return instantPreview;
  }

  const { before, after } = await replayMulticall(sdk, operation, options);

  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );
  const convert: ConvertFn = (token, to, amount) =>
    market.priceOracle.convert(token, to, amount);

  return {
    operation: "DelayedCreditAccountOperation",
    creditAccount: operation.creditAccount,
    creditManager: operation.creditManager,
    intent: delayed.intent,
    instantPreview,
    delayedPreview: buildDelayedPreview(
      after.account,
      before,
      delayed,
      convert,
    ),
  };
}
