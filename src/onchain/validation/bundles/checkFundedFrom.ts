import type {
  InsufficientBalanceError,
  TokenAmount,
} from "../../../model/index.js";
import type { AddressMap } from "../../utils/AddressMap.js";
import { checkFunding } from "../checks/index.js";

/** The wallet's side of the operation, against the balances it was given. */
export function checkFundedFrom(
  balances: AddressMap<bigint> | undefined,
  puts: readonly TokenAmount[],
): InsufficientBalanceError[] {
  if (!balances) {
    return [];
  }
  return puts.flatMap(({ token, value }) =>
    checkFunding({
      token,
      required: value,
      held: balances.get(token.address) ?? 0n,
      holderKind: "wallet",
    }),
  );
}
