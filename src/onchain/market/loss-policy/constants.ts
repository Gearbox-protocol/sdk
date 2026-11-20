export const LOSS_POLICY_ALIASED = "LOSS_POLICY::ALIASED" as const;
/**
 * An aliased loss policy that also blocks loss liquidations while a pending
 * Midas redemption of the account is rejected. Same state as the aliased one.
 **/
export const LOSS_POLICY_MIDAS_ALIASED = "LOSS_POLICY::MIDAS_ALIASED" as const;
export const LOSS_POLICY_DEFAULT = "LOSS_POLICY::DEFAULT" as const;

export const LOSS_POLICY_ACCESS_MODES = [
  "Permissionless",
  "Permissioned",
  "Forbidden",
] as const;
export type LossPolicyAccessMode = (typeof LOSS_POLICY_ACCESS_MODES)[number];
