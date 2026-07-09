import { AllowancePrerequisite } from "./AllowancePrerequisite.js";
import { BalancePrerequisite } from "./BalancePrerequisite.js";
import type { AnyPrerequisite } from "./Prerequisite.js";
import type { PrerequisiteStaticDetailMap } from "./types.js";

export type AllowanceAndBalanceProps =
  PrerequisiteStaticDetailMap["allowance"] & {
    allowanceTitle: string;
    balanceTitle: string;
  };

/**
 * The most common prerequisite pair: `owner` must have approved `spender` for
 * `required` of `token` and must hold at least that much of it.
 */
export function allowanceAndBalance(
  props: AllowanceAndBalanceProps,
): AnyPrerequisite[] {
  const { token, owner, spender, required } = props;
  return [
    new AllowancePrerequisite({
      token,
      owner,
      spender,
      required,
      title: props.allowanceTitle,
    }),
    new BalancePrerequisite({
      token,
      owner,
      required,
      title: props.balanceTitle,
    }),
  ];
}
