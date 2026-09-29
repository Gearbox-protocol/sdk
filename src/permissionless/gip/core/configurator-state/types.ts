import type { Address, Hex } from "viem";
import { z } from "zod";

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

export interface TreasurySplitterState {
  address: Address;
  defaultSplit: Split;
  // token -> split
  // token -> insuarnce
  activeProposals: TwoAdminProposal[];
  // distribute (?)
}

/**
 * Represents the complete state of a Market Configurator
 * Similar to MarketState but for configurator-level configuration
 */
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

  // Governor
  governor: GovernorState;

  // Treasury
  treasury: TreasurySplitterState;

  // Status
  shutdown: boolean;
}

/**
 * Schema for admin role types
 */
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
