import type { Address } from "viem";
import { normalizeConfiguratorState } from "./configurator-state.js";
import type {
  ConfiguratorState,
  GovernorState,
  Split,
  TreasurySplitterState,
  TwoAdminProposal,
} from "./types.js";

/**
 * Detailed comparison result for configurator states
 */
export interface ConfiguratorStateDiff {
  isEqual: boolean;
  differences: {
    address?: { old: Address; new: Address };
    version?: { old: number; new: number };
    admin?: { old: Address; new: Address };
    emergencyAdmin?: { old: Address; new: Address };
    shutdown?: { old: boolean; new: boolean };
    pausableAdmins?: {
      added: Address[];
      removed: Address[];
    };
    unpausableAdmins?: {
      added: Address[];
      removed: Address[];
    };
    governor?: {
      address?: { old: Address; new: Address };
      vetoAdmin?: { old: Address; new: Address };
      queueAdmins?: {
        added: Address[];
        removed: Address[];
      };
      executionAdmins?: {
        added: Address[];
        removed: Address[];
      };
    };
    treasury?: {
      address?: { old: Address; new: Address };
      defaultSplit?: {
        receivers?: {
          added: Address[];
          removed: Address[];
        };
        proportions?: { old: number[]; new: number[] };
      };
      activeProposals?: {
        added: TwoAdminProposal[];
        removed: TwoAdminProposal[];
      };
    };
  };
}

/**
 * Compares two arrays and returns the differences
 */
function compareArrays<T>(
  oldArray: T[],
  newArray: T[],
): { added: T[]; removed: T[] } | undefined {
  const added = newArray.filter(item => !oldArray.includes(item));
  const removed = oldArray.filter(item => !newArray.includes(item));

  if (added.length === 0 && removed.length === 0) {
    return undefined;
  }

  return { added, removed };
}

/**
 * Compares two address arrays (case-insensitive)
 */
function compareAddressArrays(
  oldArray: Address[],
  newArray: Address[],
): { added: Address[]; removed: Address[] } | undefined {
  const oldNormalized = oldArray.map(a => a.toLowerCase() as Address);
  const newNormalized = newArray.map(a => a.toLowerCase() as Address);
  return compareArrays(oldNormalized, newNormalized);
}

/**
 * Compares two proportions arrays for equality
 */
function areProportionsEqual(old: number[], new_: number[]): boolean {
  if (old.length !== new_.length) return false;
  return old.every((val, idx) => Math.abs(val - new_[idx]) < 1e-10);
}

/**
 * Compares two Split objects
 */
function compareSplits(
  oldSplit: Split,
  newSplit: Split,
):
  | {
      receivers?: {
        added: Address[];
        removed: Address[];
      };
      proportions?: { old: number[]; new: number[] };
    }
  | undefined {
  const receiversDiff = compareAddressArrays(
    oldSplit.recievers,
    newSplit.recievers,
  );
  const proportionsDiff = areProportionsEqual(
    oldSplit.proportions,
    newSplit.proportions,
  )
    ? undefined
    : { old: oldSplit.proportions, new: newSplit.proportions };

  if (!receiversDiff && !proportionsDiff) {
    return undefined;
  }

  return {
    ...(receiversDiff && { receivers: receiversDiff }),
    ...(proportionsDiff && { proportions: proportionsDiff }),
  };
}

/**
 * Compares two TwoAdminProposal arrays
 */
function compareProposals(
  oldProposals: TwoAdminProposal[],
  newProposals: TwoAdminProposal[],
): { added: TwoAdminProposal[]; removed: TwoAdminProposal[] } | undefined {
  // Compare by callData as unique identifier
  const oldCallDatas = oldProposals.map(p => p.callData);
  const newCallDatas = newProposals.map(p => p.callData);

  const added = newProposals.filter(p => !oldCallDatas.includes(p.callData));
  const removed = oldProposals.filter(p => !newCallDatas.includes(p.callData));

  if (added.length === 0 && removed.length === 0) {
    return undefined;
  }

  return { added, removed };
}

/**
 * Compares two GovernorState objects
 */
function compareGovernorStates(
  oldState: GovernorState,
  newState: GovernorState,
): ConfiguratorStateDiff["differences"]["governor"] | undefined {
  const differences: NonNullable<
    ConfiguratorStateDiff["differences"]["governor"]
  > = {};

  const oldAddress = oldState.address.toLowerCase() as Address;
  const newAddress = newState.address.toLowerCase() as Address;
  if (oldAddress !== newAddress) {
    differences.address = { old: oldAddress, new: newAddress };
  }

  const oldVetoAdmin = oldState.vetoAdmin.toLowerCase() as Address;
  const newVetoAdmin = newState.vetoAdmin.toLowerCase() as Address;
  if (oldVetoAdmin !== newVetoAdmin) {
    differences.vetoAdmin = { old: oldVetoAdmin, new: newVetoAdmin };
  }

  const queueAdminsDiff = compareAddressArrays(
    oldState.queueAdmins,
    newState.queueAdmins,
  );
  if (queueAdminsDiff) {
    differences.queueAdmins = queueAdminsDiff;
  }

  const executionAdminsDiff = compareAddressArrays(
    oldState.executionAdmins,
    newState.executionAdmins,
  );
  if (executionAdminsDiff) {
    differences.executionAdmins = executionAdminsDiff;
  }

  return Object.keys(differences).length > 0 ? differences : undefined;
}

/**
 * Compares two TreasurySplitterState objects
 */
function compareTreasuryStates(
  oldState: TreasurySplitterState,
  newState: TreasurySplitterState,
): ConfiguratorStateDiff["differences"]["treasury"] | undefined {
  const differences: NonNullable<
    ConfiguratorStateDiff["differences"]["treasury"]
  > = {};

  const oldAddress = oldState.address.toLowerCase() as Address;
  const newAddress = newState.address.toLowerCase() as Address;
  if (oldAddress !== newAddress) {
    differences.address = { old: oldAddress, new: newAddress };
  }

  const defaultSplitDiff = compareSplits(
    oldState.defaultSplit,
    newState.defaultSplit,
  );
  if (defaultSplitDiff) {
    differences.defaultSplit = defaultSplitDiff;
  }

  const proposalsDiff = compareProposals(
    oldState.activeProposals,
    newState.activeProposals,
  );
  if (proposalsDiff) {
    differences.activeProposals = proposalsDiff;
  }

  return Object.keys(differences).length > 0 ? differences : undefined;
}

/**
 * Compares two ConfiguratorState objects and returns detailed differences
 *
 * @param oldState - The original configurator state
 * @param newState - The new configurator state to compare against
 * @returns A detailed diff object showing all differences between the states
 *
 * @example
 * ```ts
 * const diff = compareConfiguratorStates(oldState, newState);
 * if (!diff.isEqual) {
 *   console.log('Admin changed:', diff.differences.admin);
 *   console.log('Pausable admins added:', diff.differences.pausableAdmins?.added);
 * }
 * ```
 */
export function compareConfiguratorStates(
  oldState: ConfiguratorState,
  newState: ConfiguratorState,
): ConfiguratorStateDiff {
  const differences: ConfiguratorStateDiff["differences"] = {};

  // Normalize states for comparison
  const oldNormalized = normalizeConfiguratorState(oldState);
  const newNormalized = normalizeConfiguratorState(newState);

  // Compare basic fields
  if (oldNormalized.address !== newNormalized.address) {
    differences.address = {
      old: oldNormalized.address,
      new: newNormalized.address,
    };
  }

  if (oldNormalized.version !== newNormalized.version) {
    differences.version = {
      old: oldNormalized.version,
      new: newNormalized.version,
    };
  }

  if (oldNormalized.admin !== newNormalized.admin) {
    differences.admin = {
      old: oldNormalized.admin,
      new: newNormalized.admin,
    };
  }

  if (oldNormalized.emergencyAdmin !== newNormalized.emergencyAdmin) {
    differences.emergencyAdmin = {
      old: oldNormalized.emergencyAdmin,
      new: newNormalized.emergencyAdmin,
    };
  }

  if (oldNormalized.shutdown !== newNormalized.shutdown) {
    differences.shutdown = {
      old: oldNormalized.shutdown,
      new: newNormalized.shutdown,
    };
  }

  // Compare arrays
  const pausableAdminsDiff = compareAddressArrays(
    oldNormalized.pausableAdmins,
    newNormalized.pausableAdmins,
  );
  if (pausableAdminsDiff) {
    differences.pausableAdmins = pausableAdminsDiff;
  }

  const unpausableAdminsDiff = compareAddressArrays(
    oldNormalized.unpausableAdmins,
    newNormalized.unpausableAdmins,
  );
  if (unpausableAdminsDiff) {
    differences.unpausableAdmins = unpausableAdminsDiff;
  }

  // Compare nested states
  const governorDiff = compareGovernorStates(
    oldNormalized.governor,
    newNormalized.governor,
  );
  if (governorDiff) {
    differences.governor = governorDiff;
  }

  const treasuryDiff = compareTreasuryStates(
    oldNormalized.treasury,
    newNormalized.treasury,
  );
  if (treasuryDiff) {
    differences.treasury = treasuryDiff;
  }

  return {
    isEqual: Object.keys(differences).length === 0,
    differences,
  };
}
