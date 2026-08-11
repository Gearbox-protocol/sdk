import type { AddCollateralOperation } from "./add-collateral/index.js";
import type { ClaimDelayedWithdrawalOperation } from "./claim-delayed/index.js";
import type { CloseCreditAccountOperation } from "./close-credit-account/index.js";
import type { DecreaseDebtOperation } from "./decrease-debt/index.js";
import type { IncreaseDebtOperation } from "./increase-debt/index.js";
import type { QuotaUpdateOperation } from "./quota-update/index.js";
import type { RepayCreditAccountOperation } from "./repay-credit-account/index.js";
import type { StartDelayedWithdrawalOperation } from "./start-delayed-withdrawal/index.js";
import type { SwapOperation } from "./swap/index.js";
import type { UnwrapRwaCollateralOperation } from "./unwrap-rwa-collateral/index.js";
import type { WithdrawCollateralOperation } from "./withdraw-collateral/index.js";
import type { WrapRwaCollateralOperation } from "./wrap-rwa-collateral/index.js";

export type AccountCalculatorOperation =
  | AddCollateralOperation
  | IncreaseDebtOperation
  | DecreaseDebtOperation
  | SwapOperation
  | WithdrawCollateralOperation
  | QuotaUpdateOperation
  | CloseCreditAccountOperation
  | RepayCreditAccountOperation
  | WrapRwaCollateralOperation
  | UnwrapRwaCollateralOperation
  | StartDelayedWithdrawalOperation
  | ClaimDelayedWithdrawalOperation;

export type OperationBuilderOption = { kind: "offchain" } | { kind: "onchain" };
