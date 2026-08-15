import type { OnchainSDK } from "../../../index.js";
import { buildQuotaUpdateOperation } from "../operations/index.js";
import type { AccountCalculatorOperation } from "../operations/types.js";
import type { CreditAccountSlice } from "../types.js";
import type { SimulateStateReturn } from "./simulate-adjust-state.js";

interface Props {
  operations: AccountCalculatorOperation[];
  state: SimulateStateReturn;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}

export function getOperationsWithQuotaUpdate({
  operations: coreOps,
  state,
  creditAccount,
  sdk,
}: Props) {
  const total =
    state.quotaResult.quotaIncrease.length +
    state.quotaResult.quotaDecrease.length;
  const operations: Array<AccountCalculatorOperation> =
    total === 0
      ? coreOps
      : [
          ...coreOps,
          buildQuotaUpdateOperation({
            update: state.quotaResult,
            creditAccount,
            sdk,
          }),
        ];

  return operations;
}
