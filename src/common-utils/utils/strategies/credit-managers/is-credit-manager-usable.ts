import { isV310 } from "../../../../sdk/index.js";

import type { CreditManagerDataSlice } from "../types.js";

export function isCreditManagerUsable(
  cm: Pick<CreditManagerDataSlice, "isBorrowingForbidden" | "version">,
) {
  return !cm.isBorrowingForbidden && isV310(cm.version);
}
