import type { EncodableCreditAccountOperation } from "../../types.js";
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

/**
 * One logical step of an intent, carrying both the calldata that realises it and
 * the amounts it was computed from.
 *
 * A superset of {@link EncodableCreditAccountOperation}: same discriminants, plus
 * the quoted amounts the preview and the tests read, plus the four composite
 * steps (close, repay, start / claim delayed withdrawal) that come from their own
 * assemblers rather than from `assembleCaOperations`.
 */
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

/**
 * The steps `sdk.accounts.assembleCaOperations` knows how to encode, as this
 * engine models them.
 */
type EncodableSubset = Extract<
  AccountCalculatorOperation,
  { type: EncodableCreditAccountOperation["type"] }
>;

/**
 * Compile-time proof that the engine's operations really are the SDK's own
 * encodable ones with the quoted amounts attached, so the two cannot drift into
 * parallel vocabularies for the same facade calls.
 */
type Extends<A extends B, B> = A;
export type _EngineOpsAreEncodable = Extends<
  EncodableSubset,
  EncodableCreditAccountOperation
>;
