import type { Address } from "viem";
import { lowerAddress } from "../../utils/addressUtils.js";
import { compact } from "../../utils/objectUtils.js";
import { normalizeConfiguratorState } from "./getConfiguratorState.js";
import type {
  ConfiguratorState,
  GovernorState,
  Split,
  TreasurySplitterState,
  TwoAdminProposal,
} from "./types.js";

/** A scalar field whose value changed. **/
type Changed<T> = { old: T; new: T };

/** Members a list gained and lost. **/
type ListChange<T> = { added: T[]; removed: T[] };

/**
 * Detailed comparison result for configurator states
 **/
export interface ConfiguratorStateDiff {
  isEqual: boolean;
  differences: {
    address?: Changed<Address>;
    version?: Changed<number>;
    admin?: Changed<Address>;
    emergencyAdmin?: Changed<Address>;
    shutdown?: Changed<boolean>;
    pausableAdmins?: ListChange<Address>;
    unpausableAdmins?: ListChange<Address>;
    lossLiquidators?: ListChange<Address>;
    emergencyLiquidators?: ListChange<Address>;
    governor?: {
      address?: Changed<Address>;
      vetoAdmin?: Changed<Address>;
      queueAdmins?: ListChange<Address>;
      executionAdmins?: ListChange<Address>;
    };
    treasury?: {
      address?: Changed<Address>;
      defaultSplit?: {
        receivers?: ListChange<Address>;
        proportions?: Changed<number[]>;
      };
      activeProposals?: ListChange<TwoAdminProposal>;
      /** Per token whose available or insurance amount differs. **/
      balances?: Record<
        Address,
        {
          available?: Changed<number>;
          insuranceAmount?: Changed<number>;
        }
      >;
    };
  };
}

type Differences = ConfiguratorStateDiff["differences"];

/** `{ old, new }` when the values differ, `undefined` when they are equal. **/
function changed<T>(oldValue: T, newValue: T): Changed<T> | undefined {
  return oldValue === newValue ? undefined : { old: oldValue, new: newValue };
}

/** Like {@link changed}, for addresses that may differ only in letter case. **/
function changedAddress(
  oldValue: Address,
  newValue: Address,
): Changed<Address> | undefined {
  return changed(lowerAddress(oldValue), lowerAddress(newValue));
}

/**
 * Members added to and removed from a list, identified by `key`.
 * `undefined` when both lists hold the same members.
 **/
function listChange<T>(
  oldItems: readonly T[],
  newItems: readonly T[],
  key: (item: T) => unknown,
): ListChange<T> | undefined {
  const oldKeys = new Set(oldItems.map(key));
  const newKeys = new Set(newItems.map(key));
  const added = newItems.filter(item => !oldKeys.has(key(item)));
  const removed = oldItems.filter(item => !newKeys.has(key(item)));

  return added.length === 0 && removed.length === 0
    ? undefined
    : { added, removed };
}

/**
 * Compares two address arrays (case-insensitive)
 **/
function compareAddressArrays(
  oldArray: readonly Address[],
  newArray: readonly Address[],
): ListChange<Address> | undefined {
  return listChange(
    oldArray.map(lowerAddress),
    newArray.map(lowerAddress),
    address => address,
  );
}

/**
 * Compares two proportions arrays for equality
 **/
function areProportionsEqual(old: number[], new_: number[]): boolean {
  if (old.length !== new_.length) return false;
  return old.every((val, idx) => Math.abs(val - new_[idx]) < 1e-10);
}

/** The fields of `differences` that are set, or `undefined` when none is. **/
function nonEmpty<T extends object>(differences: T) {
  const set = compact(differences);
  return Object.keys(set).length > 0 ? set : undefined;
}

function compareSplits(oldSplit: Split, newSplit: Split) {
  return nonEmpty({
    receivers: compareAddressArrays(oldSplit.recievers, newSplit.recievers),
    proportions: areProportionsEqual(oldSplit.proportions, newSplit.proportions)
      ? undefined
      : { old: oldSplit.proportions, new: newSplit.proportions },
  });
}

/** A proposal is the same only while its call and confirmations are. **/
function proposalKey(proposal: TwoAdminProposal): string {
  return [
    proposal.callData.toLowerCase(),
    proposal.conirmedByTreasuryProxy,
    proposal.confirmedByAdmin,
  ].join(":");
}

function compareGovernorStates(
  oldState: GovernorState,
  newState: GovernorState,
): Differences["governor"] {
  return nonEmpty({
    address: changedAddress(oldState.address, newState.address),
    vetoAdmin: changedAddress(oldState.vetoAdmin, newState.vetoAdmin),
    queueAdmins: compareAddressArrays(
      oldState.queueAdmins,
      newState.queueAdmins,
    ),
    executionAdmins: compareAddressArrays(
      oldState.executionAdmins,
      newState.executionAdmins,
    ),
  });
}

/** Like {@link changed}, ignoring float noise below 12 significant digits. **/
function changedAmount(
  oldValue: number,
  newValue: number,
): Changed<number> | undefined {
  const canon = (value: number) => Number(value.toPrecision(12));
  return canon(oldValue) === canon(newValue)
    ? undefined
    : { old: oldValue, new: newValue };
}

/**
 * Token balances that differ. A token missing on one side counts as holding
 * nothing there; states without tracked balances are not compared.
 **/
function compareBalances(
  oldBalances: TreasurySplitterState["balances"],
  newBalances: TreasurySplitterState["balances"],
) {
  if (!oldBalances || !newBalances) return undefined;
  const empty = { available: 0, insuranceAmount: 0 };
  const tokens = [
    ...new Set([...Object.keys(oldBalances), ...Object.keys(newBalances)]),
  ] as Address[];
  const differences = Object.fromEntries(
    tokens.flatMap(token => {
      const before = oldBalances[token] ?? empty;
      const after = newBalances[token] ?? empty;
      const difference = nonEmpty({
        available: changedAmount(before.available, after.available),
        insuranceAmount: changedAmount(
          before.insuranceAmount,
          after.insuranceAmount,
        ),
      });
      return difference ? [[token, difference]] : [];
    }),
  );
  return Object.keys(differences).length > 0 ? differences : undefined;
}

function compareTreasuryStates(
  oldState: TreasurySplitterState,
  newState: TreasurySplitterState,
): Differences["treasury"] {
  return nonEmpty({
    address: changedAddress(oldState.address, newState.address),
    defaultSplit: compareSplits(oldState.defaultSplit, newState.defaultSplit),
    activeProposals: listChange(
      oldState.activeProposals,
      newState.activeProposals,
      proposalKey,
    ),
    balances: compareBalances(oldState.balances, newState.balances),
  });
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
 **/
export function compareConfiguratorStates(
  oldState: ConfiguratorState,
  newState: ConfiguratorState,
): ConfiguratorStateDiff {
  const before = normalizeConfiguratorState(oldState);
  const after = normalizeConfiguratorState(newState);

  const differences: Differences = compact({
    address: changed(before.address, after.address),
    version: changed(before.version, after.version),
    admin: changed(before.admin, after.admin),
    emergencyAdmin: changed(before.emergencyAdmin, after.emergencyAdmin),
    shutdown: changed(before.shutdown, after.shutdown),
    pausableAdmins: compareAddressArrays(
      before.pausableAdmins,
      after.pausableAdmins,
    ),
    unpausableAdmins: compareAddressArrays(
      before.unpausableAdmins,
      after.unpausableAdmins,
    ),
    lossLiquidators: compareAddressArrays(
      before.lossLiquidators,
      after.lossLiquidators,
    ),
    emergencyLiquidators: compareAddressArrays(
      before.emergencyLiquidators,
      after.emergencyLiquidators,
    ),
    governor: compareGovernorStates(before.governor, after.governor),
    treasury: compareTreasuryStates(before.treasury, after.treasury),
  });

  return {
    isEqual: Object.keys(differences).length === 0,
    differences,
  };
}
