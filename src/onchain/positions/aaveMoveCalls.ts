import type { Address } from "viem";
import { toTargetDecimals } from "../accounts/intents/utils/common.js";
import { PERCENTAGE_FACTOR } from "../constants/math.js";
import type { Asset, MultiCall, OnchainSDK } from "../index.js";
import { AaveHorizonBridgeAdapterContract } from "../market/adapters/contracts/AaveHorizonBridgeAdapterContract.js";
import { AaveV3PoolAdapterContract } from "../market/adapters/contracts/AaveV3PoolAdapterContract.js";

export interface AaveMoveCallsProps {
  creditManager: Address;
  /** RWA the opening holds, as the Aave pool lists it. */
  token: Address;
  /** What the opening borrows, in underlying units. */
  debt: bigint;
  /** Quotas the opening buys; the facade adds their increase fees to the debt. */
  quotas: readonly Asset[];
}

/**
 * The calls that move an opening to Aave Horizon at the end of its own
 * multicall, the ones the finalizer bot makes a block later otherwise.
 *
 * The whole balance of `token` is supplied to the Aave pool, the Horizon
 * bridge hands the aTokens to the account owner and borrows against them into
 * the account exactly what the account owes — the debt plus the quota increase
 * fees, no interest accruing within the transaction — on an RWA market the
 * loan is wrapped back into the underlying, the quotas are dropped and the
 * debt is repaid in full.
 *
 * `undefined` when the credit manager has no Aave adapters for `token`.
 **/
export async function aaveMoveCalls(
  sdk: OnchainSDK,
  props: AaveMoveCallsProps,
): Promise<MultiCall[] | undefined> {
  const suite = sdk.marketRegister.findCreditManager(props.creditManager);
  const market = sdk.marketRegister.findByCreditManager(props.creditManager);
  const debtToken = market.unwrappedUnderlying;
  const adapters = suite.creditManager.adapters.values();
  const poolAdapter = adapters.find(
    (a): a is AaveV3PoolAdapterContract =>
      a instanceof AaveV3PoolAdapterContract && a.isAssetAllowed(props.token),
  );
  if (!poolAdapter) {
    return undefined;
  }
  const aToken = await poolAdapter.aToken(props.token);
  const bridgeAdapter = adapters.find(
    (b): b is AaveHorizonBridgeAdapterContract =>
      b instanceof AaveHorizonBridgeAdapterContract &&
      b.isATokenAllowed(aToken) &&
      b.isDebtTokenAllowed(debtToken),
  );
  if (!bridgeAdapter) {
    return undefined;
  }

  // Rounded down, as the quota keeper charges them.
  const quotaFees = props.quotas.reduce(
    (sum, q) =>
      sum +
      (q.balance *
        BigInt(market.pool.pqk.quotas.get(q.token)?.quotaIncreaseFee ?? 0)) /
        PERCENTAGE_FACTOR,
    0n,
  );
  const borrow = toTargetDecimals(
    props.debt + quotaFees,
    market.underlying,
    debtToken,
    sdk,
  );
  const wrap =
    (await sdk.accounts.assembleDepositDiffCalls(0n, props.creditManager)) ??
    [];

  return [
    poolAdapter.supplyDiffCall(props.token, 0n),
    bridgeAdapter.openPositionDiffCall(aToken, debtToken, 0n, borrow),
    ...wrap,
    ...suite.creditFacade.prepareDisableQuotas(
      props.quotas.map(q => ({ token: q.token, quota: q.balance })),
    ),
    suite.creditFacade.prepareDecreaseDebtFull(),
  ];
}
