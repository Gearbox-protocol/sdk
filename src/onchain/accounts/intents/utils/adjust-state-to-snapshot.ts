import type { Address } from "viem";
import type { AccountSnapshot } from "../../../positions/index.js";
import type { OperationState } from "../types.js";

/**
 * Maps an intents {@link OperationState} onto the {@link AccountSnapshot} that
 * position-metric functions take: the state prices what it reports, a snapshot
 * only names it.
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
    // a quota is priced in underlying, so its `value` is what a snapshot wants
    quotas: state.quotas.map(q => ({
      token: q.token.address,
      balance: q.value,
    })),
    totalDebt: state.totalDebt.value,
    totalValue: state.totalValue.value,
  };
}
