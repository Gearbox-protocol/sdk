import type { Address } from "viem";
import { zeroAddress } from "viem";
import {
  AssetsMap,
  type CreditAccountData,
  MIN_INT96,
} from "../../sdk/index.js";

/**
 * Constructor properties of {@link CreditAccountState}.
 */
export interface CreditAccountStateProps {
  creditAccount: Address;
  creditManager: Address;
  underlying: Address;
  balances?: AssetsMap;
  quotas?: AssetsMap;
  debt?: bigint;
  totalDebt?: bigint;
}

/**
 * A snapshot of a credit account's economic state (balances, quotas, debt)
 * as used by operation previews, together with the account's identity.
 *
 * Used both as the pre-state seed of a multicall replay and as the running
 * post-state mutated by it; changes are derived by diffing two snapshots.
 */
export class CreditAccountState {
  creditAccount: Address;
  creditManager: Address;
  /**
   * Credit manager underlying
   */
  underlying: Address;
  /**
   * Per-token balances
   */
  balances: AssetsMap;
  /**
   * Per-token quotas
   */
  quotas: AssetsMap;
  /**
   * Debt principal
   */
  debt: bigint;
  /**
   * Total debt: principal + accrued interest + accrued fees.
   * `decreaseDebt` amounts operate on total debt (interest and fees are
   * repaid before principal), so principal alone is not enough to resolve
   * either the underlying balance decrement or the final principal.
   */
  totalDebt: bigint;

  constructor(props: CreditAccountStateProps) {
    this.creditAccount = props.creditAccount;
    this.creditManager = props.creditManager;
    this.underlying = props.underlying;
    this.balances = props.balances ?? new AssetsMap();
    this.quotas = props.quotas ?? new AssetsMap();
    this.debt = props.debt ?? 0n;
    this.totalDebt = props.totalDebt ?? 0n;
  }

  /**
   * The account-opening seed: everything zero/empty. The account doesn't
   * exist yet at preview time, so `creditAccount` is the zero address;
   * opening previews take identity from the parsed operation instead.
   */
  public static beforeOpen(
    creditManager: Address,
    underlying: Address,
  ): CreditAccountState {
    return new CreditAccountState({
      creditAccount: zeroAddress,
      creditManager,
      underlying,
    });
  }

  /**
   * Pre-state of an existing account from its on-chain data, with dust
   * balances and quotas (≤ 1 wei) filtered out.
   */
  public static fromCreditAccountData(
    ca: CreditAccountData,
  ): CreditAccountState {
    const balances = new AssetsMap();
    const quotas = new AssetsMap();
    for (const t of ca.tokens) {
      if (t.balance > 1n) {
        balances.upsert(t.token, t.balance);
      }
      if (t.quota > 1n) {
        quotas.upsert(t.token, t.quota);
      }
    }
    return new CreditAccountState({
      creditAccount: ca.creditAccount,
      creditManager: ca.creditManager,
      underlying: ca.underlying,
      balances,
      quotas,
      debt: ca.debt,
      totalDebt: ca.debt + ca.accruedInterest + ca.accruedFees,
    });
  }

  public clone(): CreditAccountState {
    return new CreditAccountState({
      creditAccount: this.creditAccount,
      creditManager: this.creditManager,
      underlying: this.underlying,
      balances: this.balances.clone(),
      quotas: this.quotas.clone(),
      debt: this.debt,
      totalDebt: this.totalDebt,
    });
  }

  /**
   * Borrows `amount` of underlying: debt, total debt and the underlying
   * balance all increase by it.
   */
  public increaseDebt(amount: bigint): void {
    this.debt += amount;
    this.totalDebt += amount;
    this.balances.inc(this.underlying, amount);
  }

  /**
   * Repays up to `amount` of underlying against the debt, clamped to the
   * total debt (the facade never repays more than is owed). Interest and
   * fees are repaid before principal (CreditLogic.calcDecrease), so
   * principal only decreases once total debt drops below it. The underlying
   * balance decreases by the repaid amount.
   *
   * @returns The actually repaid (post-clamp) amount.
   */
  public repay(amount: bigint): bigint {
    const repaid = amount > this.totalDebt ? this.totalDebt : amount;
    this.balances.dec(this.underlying, repaid);
    this.totalDebt -= repaid;
    if (this.debt > this.totalDebt) {
      this.debt = this.totalDebt;
    }
    return repaid;
  }

  /**
   * Applies a relative `updateQuota` change to the token's quota:
   * `MIN_INT96` is the facade "disable quota" sentinel and zeroes it, other
   * changes are added with the result clamped at zero (quotas cannot go
   * negative on-chain).
   */
  public updateQuota(token: Address, change: bigint): void {
    if (change === MIN_INT96) {
      this.quotas.upsert(token, 0n);
      return;
    }
    const next = this.quotas.getOrZero(token) + change;
    this.quotas.upsert(token, next > 0n ? next : 0n);
  }
}
