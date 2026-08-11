export interface DecreaseDebtOperation {
  type: "decreaseDebt";
  amount: bigint;
}

export function buildDecreaseDebtOperation(
  amount: bigint,
): DecreaseDebtOperation {
  return {
    type: "decreaseDebt",
    amount,
  };
}
