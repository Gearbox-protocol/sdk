import { buildQuotaUpdateOperation } from "../operations/index.js";
import type { AccountCalculatorOperation } from "../operations/types.js";
import type { SimulateStateReturn } from "./simulate-adjust-state.js";

interface Props {
  operations: AccountCalculatorOperation[];
  state: SimulateStateReturn;
}

export function getOperationsWithQuotaUpdate({
  operations: coreOps,
  state,
}: Props) {
  const total =
    state.quotaResult.quotaIncrease.length +
    state.quotaResult.quotaDecrease.length;
  const operations: Array<AccountCalculatorOperation> =
    total === 0
      ? coreOps
      : [...coreOps, buildQuotaUpdateOperation(state.quotaResult)];

  return operations;
}
