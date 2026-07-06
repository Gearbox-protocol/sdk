import type { PluginsMap } from "../../sdk/index.js";
import { isPoolOperation, parseOperationCalldata } from "../parse/index.js";
import { UnsupportedOperationError } from "./errors.js";
import { previewAdjustCreditAccount } from "./previewAdjustCreditAccount.js";
import { previewOpenCreditAccount } from "./previewOpenCreditAccount.js";
import { previewPoolOperation } from "./previewPoolOperation.js";
import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
} from "./types.js";

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
    operation.operation === "SecuritizeOpenCreditAccount"
  ) {
    return previewOpenCreditAccount(input, operation);
  }

  if (
    operation.operation === "MultiCall" ||
    operation.operation === "BotMulticall" ||
    operation.operation === "SecuritizeMulticall"
  ) {
    return previewAdjustCreditAccount(input, operation, options);
  }

  throw new UnsupportedOperationError(operation.operation);
}
