import type { Address } from "viem";
import type { MarketActions } from "../actions/index.js";
import {
  copyCmActions,
  marketActionsReplaceCmAddress,
} from "../actions/index-data.js";
import type { CreateCreditSuiteAction } from "../actions/market-create-credit-suite.js";
import { GipBuilderError } from "../bundles/errors.js";

export function revertTo(
  actions: MarketActions[],
  index: number,
): MarketActions[] {
  return actions.slice(0, index + 1);
}

export function removeAdapterActions(args: {
  actions: MarketActions[];
  creditManager: Address;
  target: Address;
  keepAllowTx?: boolean;
}): MarketActions[] {
  const { actions, creditManager, target, keepAllowTx = false } = args;
  const cmAddress = creditManager.toLowerCase();
  const targetAddress = target.toLowerCase();
  return actions.filter(action => {
    if (
      !keepAllowTx &&
      action.type === "CREDIT::allowAdapter" &&
      action.params.creditManager.toLowerCase() === cmAddress &&
      action.params.adapter.target.toLowerCase() === targetAddress
    )
      return false;

    if (action.type.startsWith("ADAPTER::")) {
      const params = action.params as {
        creditManager: Address;
        target: Address;
      };
      if (
        params.creditManager.toLowerCase() === cmAddress &&
        params.target.toLowerCase() === targetAddress
      )
        return false;
    }
    return true;
  });
}

export function replaceCmActions(args: {
  actions: MarketActions[];
  index: number;
  replacement: CreateCreditSuiteAction;
  oldCm: Address;
  newCm: Address;
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
      .map(action => marketActionsReplaceCmAddress({ action, oldCm, newCm })),
  ];
}

export function copyCmActionsForMarket(args: {
  actions: MarketActions[];
  index: number;
  name: string;
  oldCm: Address;
  newCm: Address;
}): MarketActions[] {
  const { actions, index, name, oldCm, newCm } = args;
  const source = actions[index];
  if (source?.type !== "MARKET::createCreditSuite") {
    throw new GipBuilderError("CREDIT_SUITE_NOT_FOUND", "Nothing to copy");
  }
  const copied = copyCmActions({ actions, oldCm, newCm });
  return [
    ...actions,
    { type: "MARKET::createCreditSuite", params: { ...source.params, name } },
    ...copied,
  ];
}
