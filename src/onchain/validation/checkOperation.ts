import type {
  InsufficientBalanceError,
  MalformedTransactionError,
  OperationPreview,
  PoolPositionOperationPreview,
  TokenAmount,
} from "../../model/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { AddressMap } from "../utils/AddressMap.js";
import type { CreditOperationError } from "./checkCreditOperation.js";
import { checkCreditOperation } from "./checkCreditOperation.js";
import type { HealthFactorThresholds } from "./checkHealthFactors.js";
import { checkMarket } from "./checkMarket.js";
import type { PoolOperationError } from "./checkPoolOperation.js";
import { checkPoolOperation } from "./checkPoolOperation.js";
import { checkFunding, checkPreviewError } from "./checks/index.js";

export interface CheckOperationOptions extends HealthFactorThresholds {
  /**
   * Balances the operation is funded from, by token. Given, the wallet's side
   * is checked offline; omitted, funding is left to `checkPrerequisites`.
   */
  balances?: AddressMap<bigint>;
}

export interface CheckOperationInput {
  sdk: OnchainSDK;
  preview: OperationPreview;
}

/** {@inheritDoc checkOperation} */
export type OperationValidationError =
  | MalformedTransactionError
  | CreditOperationError
  | PoolOperationError
  | InsufficientBalanceError;

/**
 * Whether a parsed operation may be signed at all — the protocol state that
 * `checkPrerequisites` leaves out, since that one covers only what the sender
 * can fix themselves.
 *
 * Synchronous: the preview carries the numbers and the market is attached.
 * The array is in check order, most fundamental first, so a caller with room
 * for one verdict reports the first entry.
 */
export function checkOperation(
  input: CheckOperationInput,
  options: CheckOperationOptions = {},
): OperationValidationError[] {
  const { sdk, preview } = input;
  const { balances, ...thresholds } = options;

  // Every check below reads fields this error declares untrustworthy, so it is
  // reported alone.
  const malformed = checkPreviewError(
    "warning" in preview ? preview.warning : undefined,
  );
  if (malformed.length > 0) {
    return malformed;
  }

  switch (preview.operation) {
    case "Deposit":
    case "Mint":
      return poolErrors(sdk, preview, balances, true);
    case "Withdraw":
    case "Redeem":
      return poolErrors(sdk, preview, balances, false);
    case "DelayedCreditAccountOperation":
      // A delayed operation is judged on the half that executes now.
      return checkOperation({ sdk, preview: preview.instantPreview }, options);
    case "OpenCreditAccount":
    case "RWAOpenCreditAccount":
    case "AdjustCreditAccount":
      return [
        ...checkCreditOperation({ sdk, preview, ...thresholds }),
        ...fundedFrom(balances, preview.collateralAdded),
      ];
    case "CloseCreditAccount":
    case "RepayCreditAccount":
      // They carry a projection of the wound-down account, but the loan is
      // gone (`totalDebt` is always 0), so the health-factor thresholds would
      // no-op. Only the market's own state can stop one.
      return checkMarket(
        sdk.marketRegister.findCreditManager(preview.creditManager),
      );
  }
}

function poolErrors(
  sdk: OnchainSDK,
  preview: PoolPositionOperationPreview,
  balances: AddressMap<bigint> | undefined,
  isDeposit: boolean,
): OperationValidationError[] {
  return [
    ...checkPoolOperation({
      sdk,
      pool: preview.pool,
      isDeposit,
      tokenOut: preview.tokenOut,
    }),
    ...fundedFrom(balances, [preview.tokenIn]),
  ];
}

/** The wallet's side of the operation, against the balances it was given. */
function fundedFrom(
  balances: AddressMap<bigint> | undefined,
  puts: readonly TokenAmount[],
): InsufficientBalanceError[] {
  if (!balances) {
    return [];
  }
  return puts.flatMap(({ token, value }) =>
    checkFunding({
      token,
      required: value,
      held: balances.get(token.address) ?? 0n,
      holderKind: "wallet",
    }),
  );
}
