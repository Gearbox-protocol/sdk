import type { PluginsMap } from "../../sdk/index.js";
import { isPoolOperation, parseOperationCalldata } from "../parse/index.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";
import { isCloseOrRepay } from "./detectCloseOrRepay.js";
import { UnsupportedOperationError } from "./errors.js";
import { previewAdjustCreditAccount } from "./previewAdjustCreditAccount.js";
import { previewCloseOrRepayCreditAccount } from "./previewCloseOrRepayCreditAccount.js";
import { previewOpenCreditAccount } from "./previewOpenCreditAccount.js";
import { previewPoolOperation } from "./previewPoolOperation.js";
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
    return previewCloseOrRepayCreditAccount(input, operation, true, options);
  }

  if (
    operation.operation === "MultiCall" ||
    operation.operation === "BotMulticall" ||
    operation.operation === "RWAMulticall"
  ) {
    // A multicall that fully repays the debt and withdraws everything is a
    // zero-debt closure/repay: the account stays open but is emptied.
    if (isCloseOrRepay(operation.multicall)) {
      return previewCloseOrRepayCreditAccount(input, operation, false, options);
    }
    return previewAdjustCreditAccount(input, operation, options);
  }

  throw new UnsupportedOperationError(operation.operation);
}
