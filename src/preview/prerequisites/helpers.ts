import {
  type AllowanceDetail,
  AllowancePrerequisite,
} from "./AllowancePrerequisite.js";
import { BalancePrerequisite } from "./BalancePrerequisite.js";
import type { Prerequisite } from "./Prerequisite.js";

/**
 * The most common prerequisite pair: `owner` must have approved `spender` for
 * `required` of `token` and must hold at least that much of it.
 */
export function allowanceAndBalance(
  props: Omit<AllowanceDetail, "actual">,
): Prerequisite[] {
  const { token, owner, spender, required } = props;
  return [
    new AllowancePrerequisite({ token, owner, spender, required }),
    new BalancePrerequisite({ token, owner, required }),
  ];
}
