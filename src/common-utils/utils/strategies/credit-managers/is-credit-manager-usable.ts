import { isV310 } from "../../../../sdk/index.js";

import type { CreditManagerData_Legacy } from "../types.js";

export function isCreditManagerUsable(
  cm: Pick<CreditManagerData_Legacy, "isBorrowingForbidden" | "version">,
) {
  return !cm.isBorrowingForbidden && isV310(cm.version);
}
