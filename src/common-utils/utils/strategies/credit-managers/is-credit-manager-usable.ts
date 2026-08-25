import { isV310 } from "../../../../onchain/index.js";

import type { StrategyCreditManagerView } from "../types.js";

export function isCreditManagerUsable(
  cm: Pick<StrategyCreditManagerView, "isBorrowingForbidden" | "version">,
) {
  return !cm.isBorrowingForbidden && isV310(cm.version);
}
