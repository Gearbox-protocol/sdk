import { AbstractAdapterContract } from "../../plugins/adapters/index.js";
import {
  type AddressMap,
  type Asset,
  AssetsMap,
  MAX_UINT256,
  MIN_INT96,
  type PluginsMap,
} from "../../sdk/index.js";
import type { InnerOperation, SdkWithAdapters } from "../parse/index.js";

/**
 * Running state threaded through a credit-facade multicall by
 * {@link applyInnerOperations}. Seeded by the caller:
 * - account opening: everything zero/empty (the account doesn't exist yet);
 * - account adjustment: `balances` from the account's current token balances,
 *   `debt` from the principal, `totalDebt` from principal + accrued interest +
 *   accrued fees.
 */
export interface InnerOperationsState {
  /**
   * Cumulative credit-account balances, mutated in facade execution order.
   */
  balances: AssetsMap;
  /**
   * Debt principal
   */
  debt: bigint;
  /**
   * Total debt: principal + accrued interest + accrued fees.
   * `decreaseDebt` amounts operate on total debt (interest and fees are repaid
   * before principal), so principal alone is not enough to resolve either the
   * underlying balance decrement or the final principal.
   */
  totalDebt: bigint;
  /**
   * Cumulative amounts added via `addCollateral`.
   */
  collateralAdded: AssetsMap;
  /**
   * Cumulative amounts withdrawn via `withdrawCollateral`, with `MAX_UINT256`
   * resolved against the running balance at the point of the call.
   */
  collateralWithdrawn: AssetsMap;
  /**
   * Raw `updateQuota` changes, one entry per op. Entries are relative signed
   * changes (with the `MIN_INT96` "disable" sentinel kept as-is), not final
   * quotas: folding them requires pre-state quotas, see
   * {@link applyQuotaChanges}.
   */
  quotaChanges: Asset[];
}

/**
 * Creates an all-zero {@link InnerOperationsState} (the account-opening seed).
 */
export function makeInnerOperationsState(): InnerOperationsState {
  return {
    balances: new AssetsMap(),
    debt: 0n,
    totalDebt: 0n,
    collateralAdded: new AssetsMap(),
    collateralWithdrawn: new AssetsMap(),
    quotaChanges: [],
  };
}

/**
 * Replays a credit-facade multicall over `state`, mutating it in place in
 * facade execution order. The result is the *minimal guaranteed* post-state:
 * exact deltas for explicit facade calls, exact leftovers for diff-style
 * adapter calls inside `storeExpectedBalances`/`compareBalances` brackets and
 * enforced minimums for bracket targets. Adapter calls outside a bracket are
 * ignored: nothing enforces their outcome on-chain (e.g. reward claims and RWA
 * wrap/unwrap calls emitted by `CreditAccountsServiceV310`), so their
 * guaranteed balance change is zero.
 *
 * @throws On malformed `storeExpectedBalances`/`compareBalances` brackets and
 * on bracketed calls to non-adapter targets.
 */
export function applyInnerOperations<P extends PluginsMap>(
  sdk: SdkWithAdapters<P>,
  multicall: InnerOperation[],
  state: InnerOperationsState,
): void {
  // True between `StoreExpectedBalances` and `CompareBalances`. Every
  // router-generated call inside the bracket is diff-style: it spends the
  // consumed token down to the exact leftover encoded in its calldata, so
  // threading balances through each adapter yields the final leftovers of
  // all consumed tokens.
  let inBracket = false;
  let storeSeen = false;

  for (const op of multicall) {
    switch (op.operation) {
      case "AddCollateral":
        state.collateralAdded.inc(op.token, op.amount);
        state.balances.inc(op.token, op.amount);
        break;
      case "WithdrawCollateral": {
        // MAX_UINT256 is the facade sentinel for "withdraw the entire balance"
        const running = state.balances.get(op.token) ?? 0n;
        const amount =
          op.amount === MAX_UINT256 ? (running > 0n ? running : 0n) : op.amount;
        state.balances.dec(op.token, amount);
        state.collateralWithdrawn.inc(op.token, amount);
        break;
      }
      case "IncreaseBorrowedAmount":
        state.debt += op.amount;
        state.totalDebt += op.amount;
        state.balances.inc(op.token, op.amount);
        break;
      case "DecreaseBorrowedAmount": {
        // The facade clamps the repaid amount to the total debt (principal +
        // accrued interest + fees); MAX_UINT256 means "repay everything".
        const repaid =
          op.amount > state.totalDebt ? state.totalDebt : op.amount;
        state.balances.dec(op.token, repaid);
        state.totalDebt -= repaid;
        // Interest and fees are repaid before principal (CreditLogic.calcDecrease),
        // so principal only decreases once total debt drops below it.
        if (state.debt > state.totalDebt) {
          state.debt = state.totalDebt;
        }
        break;
      }
      case "UpdateQuota":
        state.quotaChanges.push({ token: op.token, balance: op.change });
        break;
      case "StoreExpectedBalances":
        if (storeSeen) {
          throw new Error(
            "malformed multicall: duplicate storeExpectedBalances call",
          );
        }
        storeSeen = true;
        inBracket = true;
        // Deltas are applied directly to the running balances. This assumes
        // the multicall was generated by the router's slippage control
        // (`updateSlippageControl`), which emits a single `BalanceDelta` for
        // the target token, and the target is never consumed as an adapter
        // input inside the bracket (adapters only overwrite input leftovers),
        // so nothing can clobber the applied delta.
        for (const { token, balance } of op.deltas) {
          state.balances.inc(token, balance);
        }
        break;
      case "CompareBalances":
        if (!inBracket) {
          throw new Error(
            "malformed multicall: compareBalances without a preceding storeExpectedBalances",
          );
        }
        // Purely a validation marker: on-chain, compareBalances only asserts
        // that stored minimums are met and changes no balances.
        inBracket = false;
        break;
      case "Execute":
        if (inBracket) {
          const adapter = sdk.getContract(op.adapter);
          if (!(adapter instanceof AbstractAdapterContract)) {
            throw new Error(
              `call to ${op.adapter} between storeExpectedBalances and compareBalances is not an adapter call`,
            );
          }
          adapter.previewBalanceChanges(state.balances, op.calldata);
        }
        break;
    }
  }
  if (inBracket) {
    // The router always emits storeExpectedBalances/compareBalances as a pair
    throw new Error(
      "malformed multicall: storeExpectedBalances without a matching compareBalances",
    );
  }
}

/**
 * Applies raw `updateQuota` changes to the account's initial quotas.
 *
 * Each change is applied sequentially: `MIN_INT96` disables the quota, other
 * changes are added to the running quota with the result clamped at zero
 * (quotas cannot go negative on-chain).
 *
 * @param initialQuotas - Per-token quotas before the operation.
 * @param changes - Raw changes recorded by {@link applyInnerOperations}.
 * @returns `quotas` - final non-zero per-token quotas; `quotasChange` -
 * applied (post-clamp) per-token deltas, non-zero entries only.
 */
export function applyQuotaChanges(
  initialQuotas: AssetsMap,
  changes: Asset[],
): { quotas: Asset[]; quotasChange: Asset[] } {
  const final = initialQuotas.clone();
  for (const { token, balance: change } of changes) {
    if (change === MIN_INT96) {
      final.upsert(token, 0n);
    } else {
      const next = (final.get(token) ?? 0n) + change;
      final.upsert(token, next > 0n ? next : 0n);
    }
  }

  const quotas: Asset[] = final
    .entries()
    .filter(([, balance]) => balance > 0n)
    .map(([token, balance]) => ({ token, balance }));

  // `final` is seeded with all initial tokens and only gains entries, so its
  // keys are the union of tokens present before or after
  const quotasChange: Asset[] = final
    .entries()
    .map(([token, balance]) => ({
      token,
      balance: balance - (initialQuotas.get(token) ?? 0n),
    }))
    .filter(({ balance }) => balance !== 0n);

  return { quotas, quotasChange };
}
