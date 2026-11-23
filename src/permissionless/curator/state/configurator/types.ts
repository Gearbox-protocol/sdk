import { type Address, type Hex, size, stringToBytes } from "viem";
import { z } from "zod/v4";

export interface GovernorState {
  address: Address;
  queueAdmins: Address[];
  executionAdmins: Address[];
  vetoAdmin: Address;
}

export interface Split {
  recievers: Address[];
  proportions: number[];
}

export interface SetDefaultSplitProposal extends Split {
  functionName: "setDefaultSplit";
}

export interface TwoAdminProposal {
  data: SetDefaultSplitProposal;
  callData: Hex;
  conirmedByTreasuryProxy: boolean;
  confirmedByAdmin: boolean;
}

/** What the treasury splitter holds of one token, in token units. **/
export interface TreasuryTokenBalance {
  /**
   * What `distribute` would send to the split's receivers: the splitter's
   * balance above the insurance amount, or zero.
   **/
  available: number;
  /** What `distribute` keeps on the splitter (`tokenInsuranceAmount`). **/
  insuranceAmount: number;
}

export interface TreasurySplitterState {
  address: Address;
  defaultSplit: Split;
  activeProposals: TwoAdminProposal[];
  /**
   * Tokens the configurator's markets pay fees in — every pool token and
   * underlying — by token address. States persisted before balances were
   * tracked have no such field.
   **/
  balances?: Record<Address, TreasuryTokenBalance>;
}

/**
 * Represents the complete state of a Market Configurator
 * Similar to MarketState but for configurator-level configuration
 **/
export interface ConfiguratorState {
  // Basic info
  address: Address;
  version: number;

  // Governance
  admin: Address;
  emergencyAdmin: Address;
  pausableAdmins: Address[];
  unpausableAdmins: Address[];
  lossLiquidators: Address[];
  emergencyLiquidators: Address[];
  /**
   * Holders of every other role in the configurator's ACL, by role name (for
   * example `OPENING_SIGNER`): the roles without a field of their own above.
   * A role whose holders were all revoked stays, with no holders, as it does
   * in the ACL. States persisted before these roles were tracked have no such
   * field.
   **/
  otherRoles?: Record<string, Address[]>;

  // Governor
  governor: GovernorState;

  // Treasury
  treasury: TreasurySplitterState;

  // Status
  shutdown: boolean;
}

/**
 * Schema for admin role types
 **/
export const adminRoleSchema = z.enum([
  "PAUSABLE_ADMIN",
  "UNPAUSABLE_ADMIN",
  "LOSS_LIQUIDATOR",
  "EMERGENCY_LIQUIDATOR",
]);
export type AdminRole = z.infer<typeof adminRoleSchema>;

export const adminRoleLabelMap: Record<AdminRole, string> = {
  PAUSABLE_ADMIN: "Pausable Admin",
  UNPAUSABLE_ADMIN: "Unpausable Admin",
  LOSS_LIQUIDATOR: "Loss Liquidator",
  EMERGENCY_LIQUIDATOR: "Emergency Liquidator",
};

/**
 * Every role a Gearbox contract checks in the configurator's ACL, by name:
 * - `PAUSABLE_ADMIN`, `UNPAUSABLE_ADMIN`: pause and unpause market contracts
 *   (core-v3 `ACLTrait`);
 * - `EMERGENCY_LIQUIDATOR`: liquidates while a credit facade is paused
 *   (`CreditFacadeV3`);
 * - `LOSS_LIQUIDATOR`: liquidates with loss under a permissioned aliased loss
 *   policy (`AliasedLossPolicyV3`);
 * - `OPENING_SIGNER`: signs credit account openings for a signature degen NFT
 *   (`SignatureDegenNFT`).
 **/
export const knownRoleLabelMap: Record<AdminRole | "OPENING_SIGNER", string> = {
  ...adminRoleLabelMap,
  OPENING_SIGNER: "Opening Signer",
};
export type KnownRole = keyof typeof knownRoleLabelMap;

/**
 * Schema for a role name, as `CONFIGURATOR::grantRole` and `revokeRole` take
 * it: the configurator passes any `bytes32` role to its ACL, so any name
 * fits. It must fit in 32 bytes and consist of printable ASCII without spaces,
 * so that it reads back from the chain as it was written.
 **/
export const roleNameSchema = z
  .string()
  .regex(/^[\x21-\x7e]+$/, "Role must be printable ASCII without spaces")
  .refine(role => size(stringToBytes(role)) <= 32, {
    message: "Role must fit in 32 bytes",
  });
