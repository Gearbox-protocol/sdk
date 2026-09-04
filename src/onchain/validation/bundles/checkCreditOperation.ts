import type { Address } from "viem";
import type {
  AdjustStrategyPositionPreview,
  DebtOutOfRangeError,
  ForbiddenTokenError,
  InsufficientCollateralError,
  InsufficientPoolLiquidityError,
  OpenStrategyPositionPreview,
  QuotaCountExceededError,
  QuotaLimitReachedError,
  RWAOpenRequirementsError,
} from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { checkDebtLimits } from "../checks/index.js";
import { toToken } from "../helpers/index.js";
import { checkAccountQuotas } from "./checkAccountQuotas.js";
import { checkCollateralFunding } from "./checkCollateralFunding.js";
import { checkDraw } from "./checkDraw.js";
import type { HealthFactorThresholds } from "./checkHealthFactors.js";
import { checkHealthFactors } from "./checkHealthFactors.js";
import type { MarketStateError } from "./checkMarket.js";
import { checkMarket } from "./checkMarket.js";
import { checkObtained } from "./checkObtained.js";
import { checkQuotasAsked } from "./checkQuotasAsked.js";
import { checkRWAOpening } from "./checkRWAOpening.js";
import type { WalletFundingError } from "./checkWallet.js";

/** {@inheritDoc checkCreditOperation} */
export type CreditOperationError =
  | MarketStateError
  | DebtOutOfRangeError
  | InsufficientPoolLiquidityError
  | ForbiddenTokenError
  | QuotaCountExceededError
  | QuotaLimitReachedError
  | InsufficientCollateralError
  | WalletFundingError
  | RWAOpenRequirementsError;

/** The two previews that carry a position for the thresholds to weigh. */
export type CreditOperationPreview =
  | OpenStrategyPositionPreview
  | AdjustStrategyPositionPreview;

export interface CreditOperationArgs extends HealthFactorThresholds {
  sdk: OnchainSDK;
  preview: CreditOperationPreview;
  /** The wallet that signs. Its balances, allowances and RWA standing are read on-chain. */
  sender: Address;
  blockNumber?: bigint;
}

/**
 * What the protocol stops a credit operation for, then what the wallet still
 * has to hold, approve or sign.
 *
 * The array is in check order, most fundamental first: the market's own state,
 * then what the facade would revert on, then what the operation asks the
 * market for, then the account it leaves behind, and last the wallet's side.
 */
export async function checkCreditOperation(
  args: CreditOperationArgs,
): Promise<CreditOperationError[]> {
  const { sdk, preview, sender, blockNumber, ...thresholds } = args;
  const suite = sdk.marketRegister.findCreditManager(preview.creditManager);
  const market = suite.market;
  const underlying = toToken(sdk, market.pool.underlying);
  const isOpening =
    preview.operation === "OpenCreditAccount" ||
    preview.operation === "RWAOpenCreditAccount";

  const protocol: CreditOperationError[] = [
    ...checkMarket(suite),
    // An account being opened has to carry a real loan; one being adjusted may
    // end owing nothing at all.
    ...checkDebtLimits({
      debt: preview.totalDebt.value,
      minDebt: suite.creditFacade.minDebt,
      maxDebt: suite.creditFacade.maxDebt,
      underlying,
      allowZero: !isOpening,
    }),
    ...checkDraw(suite, preview, underlying),
    ...checkObtained(suite, preview),
    ...checkAccountQuotas(suite, preview),
    ...checkQuotasAsked(market, preview, underlying),
    // The floor branch, since that is the only one a parsed transaction carries.
    ...checkHealthFactors(
      {
        totalDebt: preview.totalDebt,
        healthFactor: preview.estHealthFactor,
        safeHealthFactor: preview.estSafeHealthFactor,
      },
      thresholds,
    ),
  ];

  const [funding, rwa] = await Promise.all([
    checkCollateralFunding({ sdk, preview, sender, blockNumber }),
    preview.operation === "RWAOpenCreditAccount"
      ? checkRWAOpening({ sdk, preview, sender })
      : [],
  ]);
  return [...protocol, ...funding, ...rwa];
}
