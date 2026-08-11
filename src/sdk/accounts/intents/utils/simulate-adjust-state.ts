import type { OnchainSDK } from "../../../index.js";
import type { QuotaUpdateState } from "../operations/quota-update/index.js";
import type { AccountCalculatorOperation } from "../operations/types.js";
import type { AdjustState, CreditAccountSlice } from "../types.js";
import { getQuotasForUpdate } from "./quotas-for-update.js";
import { type ConvertFn, simulateOperationAssets } from "./simulate-assets.js";

interface Props {
  operations: AccountCalculatorOperation[];
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  quotaReserve: number | undefined;
}

export type SimulateStateReturn = ReturnType<typeof simulateState>;

export function simulateState(props: Props): {
  state: AdjustState;
  quotaResult: QuotaUpdateState;
} {
  const market = props.sdk.marketRegister.findByCreditManager(
    props.creditAccount.creditManager,
  );
  const convert: ConvertFn = (token, to, amount) =>
    market.priceOracle.convert(token, to, amount);

  const creditManager = props.sdk.marketRegister.findCreditManager(
    props.creditAccount.creditManager,
  );

  const { assets, totalValue, debt } = simulateOperationAssets({
    initialAssets: props.creditAccount.tokens,
    operations: props.operations,
    underlyingToken: props.creditAccount.underlying,
    debt: props.creditAccount.accountDebt,
    convert,
  });

  const quotaResult = getQuotasForUpdate({
    assetsBefore: props.creditAccount.tokens,
    assetsAfter: assets,
    liquidationThresholds: creditManager.creditManager.liquidationThresholds,
    quotas: market.pool.pqk.quotas,
    initialQuotas: props.creditAccount.tokens,
    quotaReserve: props.quotaReserve,
    underlyingToken: props.creditAccount.underlying,
    maxDebt: creditManager.creditFacade.maxDebt,
    convert,
  });

  return {
    state: {
      kind: "adjust",
      totalValue,
      accountDebt: debt,
      assets,
      quotas: quotaResult.desiredQuota,
    },
    quotaResult,
  };
}
