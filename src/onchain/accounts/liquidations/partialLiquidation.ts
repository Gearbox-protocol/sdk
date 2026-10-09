import type { Address } from "viem";
import type { CreditAccountData } from "../../base/index.js";
import type { CreditSuite } from "../../market/index.js";
import { dominantCollateral } from "../../market/index.js";
import {
  minSeizedAmount,
  type OptimalPartialLiquidationAmounts,
  optimalPartialLiquidationAmounts,
} from "../../market/math.js";
import type { PartialLiquidationParams } from "./types.js";

/**
 * Inputs of {@link optimalPartialLiquidation}.
 **/
export interface OptimalPartialLiquidationProps {
  /**
   * Credit suite of the account.
   **/
  suite: CreditSuite;
  /**
   * Credit account to partially liquidate.
   **/
  account: CreditAccountData;
  /**
   * Health factor to aim for, in basis points. Defaults to
   * {@link CreditSuite.optimalHFForPartialLiquidation}.
   **/
  optimalHF?: bigint;
  /**
   * Tokens that cannot be seized.
   **/
  exclude?: (token: Address) => boolean;
}

/**
 * Partial liquidation that brings the account's health factor close to the
 * target, see {@link OptimalPartialLiquidationAmounts}.
 **/
export interface OptimalPartialLiquidation
  extends OptimalPartialLiquidationAmounts {
  /**
   * Collateral token to seize.
   **/
  tokenOut: Address;
}

/**
 * Inputs of {@link partialLiquidationParams}.
 **/
export interface PartialLiquidationParamsProps {
  /**
   * Credit suite of the account.
   **/
  suite: CreditSuite;
  /**
   * Credit account to partially liquidate.
   **/
  account: CreditAccountData;
  /**
   * Parameters to use instead of the derived defaults.
   **/
  overrides?: PartialLiquidationParams;
  /**
   * Tokens that cannot be picked as the default `tokenOut`.
   **/
  exclude?: (token: Address) => boolean;
}

/**
 * Optimal partial liquidation of an account: the collateral to seize and the
 * amounts that bring its health factor close to `optimalHF`.
 *
 * Ported from solidity, without the price updates the contract applies first:
 * https://github.com/Gearbox-protocol/router-v3/blob/56e2d515ec6d9bb1e324e71c3708e59710779b24/contracts/liquidation/AbstractLiquidator.sol#L252
 *
 * @throws If no `tokenOut` can be picked.
 **/
export function optimalPartialLiquidation({
  suite,
  account,
  optimalHF = suite.optimalHFForPartialLiquidation(account),
  exclude,
}: OptimalPartialLiquidationProps): OptimalPartialLiquidation {
  const tokenOut = bestTokenOut(suite, account, exclude);
  return {
    tokenOut,
    ...optimalAmounts(suite, account, tokenOut, optimalHF),
  };
}

/**
 * Everything a partial liquidation of credit account needs, with any parameter
 * the caller pinned down taken as given and the rest derived from current state.
 *
 * @throws If a derived `tokenOut` cannot be picked, or if the seized token is
 * not a collateral token of the credit manager.
 **/
export function partialLiquidationParams({
  suite,
  account,
  overrides = {},
  exclude,
}: PartialLiquidationParamsProps): Required<PartialLiquidationParams> {
  const tokenOut = overrides.tokenOut ?? bestTokenOut(suite, account, exclude);
  const optimalHF =
    overrides.optimalHF ?? suite.optimalHFForPartialLiquidation(account);
  const repaidAmount =
    overrides.repaidAmount ??
    optimalAmounts(suite, account, tokenOut, optimalHF).repaidAmount;
  const minSeized =
    overrides.minSeizedAmount ??
    minSeizedAmountOf(suite, tokenOut, repaidAmount);
  return { tokenOut, optimalHF, repaidAmount, minSeizedAmount: minSeized };
}

function bestTokenOut(
  suite: CreditSuite,
  account: CreditAccountData,
  exclude?: (token: Address) => boolean,
): Address {
  const collateral = dominantCollateral(account, suite.market, exclude);
  if (!collateral) {
    throw new Error(
      `cannot determine tokenOut for partial liquidation of ${suite.register.labelAddress(account.creditAccount)}: no enabled non-underlying collateral with value`,
    );
  }
  return collateral;
}

/**
 * @throws If `tokenOut` is not a collateral token of the credit manager.
 **/
function optimalAmounts(
  suite: CreditSuite,
  account: CreditAccountData,
  tokenOut: Address,
  optimalHF: bigint,
): OptimalPartialLiquidationAmounts {
  const { creditManager: cm, market } = suite;
  const { feeLiquidation, liquidationDiscount } = suite.liquidationFees();

  const ltTokenOut = cm.liquidationThresholds.get(tokenOut);
  if (ltTokenOut === undefined) {
    throw new Error(
      `token ${suite.register.labelAddress(tokenOut)} is not a collateral token in credit manager ${suite.register.labelAddress(cm.address)}`,
    );
  }

  return optimalPartialLiquidationAmounts({
    totalDebt: account.debt + account.accruedInterest + account.accruedFees,
    twvUnderlying: market.priceOracle.convertFromUSD(
      market.underlying,
      account.twvUSD,
    ),
    minDebt: suite.creditFacade.minDebt,
    optimalHF,
    liquidationDiscount: BigInt(liquidationDiscount),
    discount: BigInt(liquidationDiscount) - BigInt(feeLiquidation),
    ltTokenOut: BigInt(ltTokenOut),
  });
}

/**
 * Minimum amount of `token` that must be seized when repaying `repaidAmount`
 * of underlying.
 **/
function minSeizedAmountOf(
  suite: CreditSuite,
  token: Address,
  repaidAmount: bigint,
): bigint {
  const { market } = suite;
  const tokenAmount = market.priceOracle.convert(
    market.underlying,
    token,
    repaidAmount,
  );
  return minSeizedAmount(
    tokenAmount,
    suite.liquidationFees().liquidationDiscount,
  );
}
