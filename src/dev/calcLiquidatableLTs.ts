import type { Address } from "viem";

import type { CreditAccountData, GearboxSDK, ILogger } from "../sdk/index.js";
import { isDust, PERCENTAGE_FACTOR, WAD } from "../sdk/index.js";

/**
 * Given credit accounts, calculates new liquidation thresholds that needs to be set to drop account health factor a bit to make it eligible for partial liquidation
 * @param ca
 */
export async function calcLiquidatableLTs(
  sdk: GearboxSDK,
  ca: CreditAccountData,
  factor = 9990n,
  logger?: ILogger,
): Promise<Record<Address, number>> {
  const cm = sdk.marketRegister.findCreditManager(ca.creditManager);
  const market = sdk.marketRegister.findByCreditManager(ca.creditManager);

  // Sort account tokens by weighted value descending, but underlying token comes last
  const weightedBalances = ca.tokens
    .filter(({ token, balance }) => {
      return !isDust({ sdk, token, balance, creditManager: ca.creditManager });
    })
    .map(t => {
      const { token, balance } = t;
      const balanceU = market.priceOracle.convert(
        token,
        ca.underlying,
        balance,
      );
      const lt = BigInt(cm.creditManager.liquidationThresholds.mustGet(token));
      return {
        token,
        weightedBalance: (balanceU * lt) / PERCENTAGE_FACTOR,
        lt,
      };
    })
    .sort((a, b) => {
      if (a.token === ca.underlying) return 1;
      if (b.token === ca.underlying) return -1;
      return b.weightedBalance > a.weightedBalance ? 1 : -1;
    });

  // LTnew = LT * k, where
  //
  //        totalDebt - B_underlying * LT_underlying
  // k = -------------------------------------------------------------
  //                    sum(p * b* LT)
  let divisor = 0n;
  let dividend =
    (factor * (ca.debt + ca.accruedInterest + ca.accruedFees)) /
    PERCENTAGE_FACTOR; // TODO: USDT fee
  for (const { token, weightedBalance } of weightedBalances) {
    if (token === ca.underlying) {
      dividend -= weightedBalance;
    } else {
      divisor += weightedBalance;
    }
  }
  if (divisor === 0n) {
    throw new Error("warning: assets have zero weighted value in underlying");
  }
  if (dividend <= 0n) {
    throw new Error(`warning: account balance in underlying covers debt`);
  }
  const k = (WAD * dividend) / divisor;

  const result: Record<Address, number> = {};
  for (const { token, lt: oldLT } of weightedBalances) {
    if (token !== ca.underlying) {
      const newLT = (oldLT * k) / WAD;
      logger?.debug(
        `proposed ${sdk.tokensMeta.symbol(token)} LT change: ${oldLT} => ${newLT} `,
      );
      result[token] = Number(newLT);
    }
  }
  return result;
}
