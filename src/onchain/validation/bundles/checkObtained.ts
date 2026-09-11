import type { ForbiddenTokenError } from "../../../model/index.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { checkForbiddenToken } from "../checks/index.js";
import type { CreditOperationPreview } from "./checkCreditOperation.js";

/** Every token the operation buys more of, against what the market forbids. */
export function checkObtained(
  suite: CreditSuite,
  preview: CreditOperationPreview,
): ForbiddenTokenError[] {
  const obtained =
    preview.operation === "AdjustCreditAccount"
      ? preview.assetsChange
      : preview.estAssets;

  return obtained
    .filter(asset => asset.value > 0n)
    .flatMap(asset =>
      checkForbiddenToken({
        token: asset.token,
        isForbidden: suite.isForbidden(asset.token.address),
      }),
    );
}
