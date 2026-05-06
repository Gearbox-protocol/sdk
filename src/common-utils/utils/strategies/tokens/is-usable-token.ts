import type { IsTargetableProps } from "../types.js";

import { isActivatedToken } from "./is-activated-token.js";
import { isForbiddenToken } from "./is-forbidden-token.js";

export function isUsableToken({ address, creditManager }: IsTargetableProps) {
  return (
    !isForbiddenToken({ address, creditManager }) &&
    isActivatedToken({ address, creditManager })
  );
}
