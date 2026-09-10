import type {
  InsufficientPoolLiquidityError,
  Token,
} from "../../../model/index.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { checkBorrowLimit } from "../checks/index.js";
import type { CreditOperationPreview } from "./checkCreditOperation.js";

/**
 * What the transaction borrows, against what the market can lend right now.
 *
 * Only a debt increase is weighed: repaying, or leaving the debt alone, can
 * never exceed the borrow limit. Opening borrows the whole debt; adjusting
 * borrows `totalDebtChange`.
 *
 * The engine holds every simulation to this already (`assertCanBorrow`), so
 * this is here for the transactions it never saw — a pasted calldata reaches
 * the confirm screen with nothing else standing between it and a revert.
 */
export function checkIncreaseDebt(
  suite: CreditSuite,
  preview: CreditOperationPreview,
  underlying: Token,
): InsufficientPoolLiquidityError[] {
  const debtIncrease =
    preview.operation === "AdjustCreditAccount"
      ? preview.totalDebtChange.value
      : preview.totalDebt.value;
  if (debtIncrease <= 0n) {
    return [];
  }
  const maxBorrowAmount = suite.maxBorrowAmount();
  return checkBorrowLimit({
    requested: debtIncrease,
    available: maxBorrowAmount.amount.value,
    limit: maxBorrowAmount.limit,
    underlying,
  });
}
