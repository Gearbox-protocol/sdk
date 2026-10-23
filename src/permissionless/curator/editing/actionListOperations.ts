import type { Address } from "viem";
import type { CreateCreditSuiteAction } from "../actions/createCreditSuiteActionData.js";
import {
  type CreditManagerTarget,
  isSameTarget,
  retargetCreditManager,
  targetOf,
} from "../actions/creditManagerTargets.js";
import type { MarketActions } from "../actions/types.js";
import { GipBuilderError } from "../bundles/GipBuilderError.js";
import { isSameAddress } from "../utils/addressUtils.js";

export function revertTo(
  actions: MarketActions[],
  index: number,
): MarketActions[] {
  return actions.slice(0, index + 1);
}

/**
 * Drops everything recorded for one adapter of a credit manager: the adapter's
 * own actions and, unless `keepAllowTx`, the action that allowed it.
 **/
export function removeAdapterActions(args: {
  actions: MarketActions[];
  creditManager: CreditManagerTarget;
  target: Address;
  keepAllowTx?: boolean;
}): MarketActions[] {
  const { actions, creditManager, target, keepAllowTx = false } = args;
  const isThisAdapter = (params: {
    creditManager: CreditManagerTarget;
    target: Address;
  }) =>
    isSameTarget(params.creditManager, creditManager) &&
    isSameAddress(params.target, target);

  return actions.filter(action => {
    if (action.type === "CREDIT::allowAdapter") {
      return (
        keepAllowTx ||
        !isThisAdapter({
          creditManager: action.params.creditManager,
          target: action.params.adapter.target,
        })
      );
    }
    if (action.type.startsWith("ADAPTER::")) {
      return !isThisAdapter(
        action.params as {
          creditManager: CreditManagerTarget;
          target: Address;
        },
      );
    }
    return true;
  });
}

/**
 * Replaces the credit suite deployed at `index` and moves every later action
 * that targets `oldCm` to `newCm`.
 *
 * Actions that name the suite by reference (`suite:<id>`) follow it without
 * retargeting, as long as the replacement keeps the id.
 **/
export function replaceCmActions(args: {
  actions: MarketActions[];
  index: number;
  replacement: CreateCreditSuiteAction;
  oldCm: CreditManagerTarget;
  newCm: CreditManagerTarget;
}): MarketActions[] {
  const { actions, index, replacement, oldCm, newCm } = args;
  if (index < 0 || actions[index]?.type !== "MARKET::createCreditSuite") {
    throw new GipBuilderError("CREDIT_SUITE_NOT_FOUND", "Nothing to replace");
  }
  return [
    ...actions.slice(0, index),
    replacement,
    ...actions
      .slice(index + 1)
      .map(action => retargetCreditManager(action, oldCm, newCm)),
  ];
}

/** Copies of the actions that target `oldCm`, retargeted to `newCm`. **/
export function copyCmActions(args: {
  actions: readonly MarketActions[];
  oldCm: CreditManagerTarget;
  newCm: CreditManagerTarget;
}): MarketActions[] {
  const { actions, oldCm, newCm } = args;
  return actions.flatMap(action => {
    const target = targetOf(action.params);
    return target !== undefined && isSameTarget(target, oldCm)
      ? [retargetCreditManager(action, oldCm, newCm)]
      : [];
  });
}

/**
 * Appends a copy of the credit suite deployed at `index`, under `name`, and
 * copies of every action configuring it, retargeted from `oldCm` to `newCm`.
 * A suite with an id gets `<id>#<name>` as the copy's id, so the copy does not
 * merge into the original.
 **/
export function copyCmActionsForMarket(args: {
  actions: MarketActions[];
  index: number;
  name: string;
  oldCm: CreditManagerTarget;
  newCm: CreditManagerTarget;
}): MarketActions[] {
  const { actions, index, name, oldCm, newCm } = args;
  const source = actions[index];
  if (source?.type !== "MARKET::createCreditSuite") {
    throw new GipBuilderError("CREDIT_SUITE_NOT_FOUND", "Nothing to copy");
  }
  const { id } = source.params;
  return [
    ...actions,
    {
      type: "MARKET::createCreditSuite",
      params: {
        ...source.params,
        name,
        ...(id === undefined ? {} : { id: `${id}#${name}` }),
      },
    },
    ...copyCmActions({ actions, oldCm, newCm }),
  ];
}
