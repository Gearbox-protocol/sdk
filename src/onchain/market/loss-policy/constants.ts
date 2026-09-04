export const LOSS_POLICY_ALIASED = "LOSS_POLICY::ALIASED" as const;
export const LOSS_POLICY_DEFAULT = "LOSS_POLICY::DEFAULT" as const;

export const LOSS_POLICY_ACCESS_MODES = [
  "Permissionless",
  "Permissioned",
  "Forbidden",
] as const;
export type LossPolicyAccessMode = (typeof LOSS_POLICY_ACCESS_MODES)[number];
