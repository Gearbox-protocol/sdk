import type { Address } from "abitype";

import type { BaseState, IBaseContract } from "../base/index.js";

export function toAddress(value: Address | BaseState | IBaseContract): Address {
  if (typeof value === "string") {
    return value;
  }
  if ("baseParams" in value) {
    return value.baseParams.addr;
  }
  return value.address;
}
