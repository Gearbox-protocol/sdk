import type { ForbiddenTokenError, Token } from "../../../model/index.js";
import { forbiddenToken } from "../../../model/index.js";

export interface ForbiddenTokenArgs {
  token: Token;
  isForbidden: boolean;
}

/** A token the market will not let the account hold more of. */
export function checkForbiddenToken(
  args: ForbiddenTokenArgs,
): ForbiddenTokenError[] {
  return args.isForbidden ? [forbiddenToken(args.token)] : [];
}
