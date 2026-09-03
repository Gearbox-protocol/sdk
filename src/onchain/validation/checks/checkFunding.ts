import type { InsufficientBalanceError, Token } from "../../../model/index.js";
import { insufficientBalance } from "../../../model/index.js";
import { amountOf } from "../helpers/index.js";

export interface FundingArgs {
  token: Token;
  required: bigint;
  held: bigint;
  /** Whose balance was read, when the caller knows. */
  holderKind?: InsufficientBalanceError["holderKind"];
  holder?: InsufficientBalanceError["holder"];
}

/** What the operation is funded from, against what is there. */
export function checkFunding(args: FundingArgs): InsufficientBalanceError[] {
  const { token, required, held, holderKind, holder } = args;
  if (required <= held) {
    return [];
  }
  return [
    insufficientBalance({
      required: amountOf(token, required),
      held: amountOf(token, held),
      ...(holderKind === undefined ? {} : { holderKind }),
      ...(holder === undefined ? {} : { holder }),
    }),
  ];
}
