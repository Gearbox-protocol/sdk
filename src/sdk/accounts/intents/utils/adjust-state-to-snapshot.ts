import type { Address } from "viem";
import type { AccountSnapshot } from "../../../positions/index.js";
import type { OperationState } from "../types.js";

/**
 * Maps an intents {@link OperationState} onto the {@link AccountSnapshot} that
 * position-metric functions take. `accountDebt` is treated as total debt
 * (principal plus accrued interest and fees).
 **/
export function adjustStateToSnapshot(
  creditManager: Address,
  state: OperationState,
): AccountSnapshot {
  return {
    creditManager,
    // the state prices its holdings; a snapshot names them
    assets: state.assets.map(a => ({
      token: a.token.address,
      balance: a.value,
    })),
    quotas: Object.values(state.quotas),
    totalDebt: state.accountDebt,
    totalValue: state.totalValue,
  };
}
