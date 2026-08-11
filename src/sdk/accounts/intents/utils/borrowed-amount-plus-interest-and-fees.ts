/**
 * Total debt of a credit account: principal + accrued interest + accrued fees.
 *
 * On the v3 SDK `CreditAccountData` the parts
 * come as separate `debt` / `accruedInterest` / `accruedFees` fields.
 */
export function calcBorrowedAmountPlusInterestAndFees(ca: {
  /** Debt principal in underlying. */
  debt: bigint;
  /** Base and quota interest accrued on the account. */
  accruedInterest: bigint;
  /** Fees accrued on the account. */
  accruedFees: bigint;
}): bigint {
  return ca.debt + ca.accruedInterest + ca.accruedFees;
}
