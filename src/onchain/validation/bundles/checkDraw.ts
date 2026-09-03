import type {
  InsufficientPoolLiquidityError,
  Token,
} from "../../../model/index.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { checkBorrowLimit } from "../checks/index.js";
import type { CreditOperationPreview } from "./checkCreditOperation.js";

/**
 * What the transaction draws, against what the market can lend right now.
 *
 * Only a draw is weighed: repaying, or leaving the debt alone, can never exceed
 * a ceiling. Opening borrows the whole debt; adjusting borrows
 * `totalDebtChange`.
 *
 * The engine holds every simulation to this already (`assertCanBorrow`), so
 * this is here for the transactions it never saw — a pasted calldata reaches
 * the confirm screen with nothing else standing between it and a revert.
 */
export function checkDraw(
  suite: CreditSuite,
  preview: CreditOperationPreview,
  underlying: Token,
): InsufficientPoolLiquidityError[] {
  const drawn =
    preview.operation === "AdjustCreditAccount"
      ? preview.totalDebtChange.value
      : preview.totalDebt.value;
  if (drawn <= 0n) {
    return [];
  }
  const { value, limit } = suite.maxBorrowAmount();
  return checkBorrowLimit({
    requested: drawn,
    available: value,
    limit,
    underlying,
  });
}
