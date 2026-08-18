import type { Address } from "viem";
import type { AccountSnapshot } from "../../position-metrics/index.js";
import type { AdjustState } from "../types.js";

/**
 * Maps an intents {@link AdjustState} onto the {@link AccountSnapshot} that
 * position-metric functions take. `accountDebt` is treated as total debt
 * (principal plus accrued interest and fees).
 **/
export function adjustStateToSnapshot(
  creditManager: Address,
  state: AdjustState,
): AccountSnapshot {
  return {
    creditManager,
    assets: state.assets,
    quotas: Object.values(state.quotas),
    totalDebt: state.accountDebt,
    totalValue: state.totalValue,
  };
}
