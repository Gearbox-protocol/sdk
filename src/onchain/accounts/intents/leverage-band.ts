import type { Address } from "viem";
import type { Bps, Leverage, StrategyPosition } from "../../../model/index.js";
import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import type { Asset, OnchainSDK } from "../../index.js";
import type { ConvertFn } from "../../market/oracle/types.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import { strategyLimits } from "./strategyLimits.js";
import { eq, resolveCreditManager } from "./utils/common.js";
import { accountView } from "./view.js";

/** The leverages a position of a given size can be opened at, or moved to. */
export interface LeverageBand {
  readonly min: Leverage;
  readonly max: Leverage;
}

export interface LeverageBandProps {
  readonly sdk: OnchainSDK;
  /** Credit manager the position lives in; every limit is read off it. */
  readonly creditManager: Address;
  /**
   * Tokens deposited when opening a position. Ignored when `account` selects
   * adjust mode, because that mode derives own funds from the account slice.
   **/
  readonly collateral: readonly Asset[];
  /**
   * Health factor the maxed leverage should leave the position at, in basis
   * points. Omitted keeps `calcMaxLeverage` on its flat buffer.
   **/
  readonly targetHF?: Bps;
  /** Existing position; when present, its debt and quotas define an adjust band. */
  readonly position?: StrategyPosition;
}

/**
 * The leverages this market will actually fund for a position of this size.
 *
 * A credit manager's `maxLeverage` follows from the liquidation threshold
 * alone, so it is the same for a hundred dollars and for a million. What a
 * given deposit reaches is decided by the debt it implies —
 * `debt = netValue × (leverage − 1)` — and by the `debtLimits` the market puts that
 * debt in. This inverts that relation.
 *
 * Rounding is asymmetric because the forward direction truncates: the floor
 * rounds **up** so the leverage it names really does clear `minDebt`, and the
 * ceiling rounds **down** so it really does stay under the borrow limit.
 *
 * Nothing here is fetched or simulated — adjust state comes from the supplied
 * position and the attached market, so a form can call this on each keystroke.
 *
 * @param props - {@link LeverageBandProps}
 * @returns The band, or `undefined` when there is nothing to offer: an
 * unknown manager, a market with no strategy, or a deposit too small to reach
 * `minDebt` at any leverage the threshold allows.
 *
 * @example
 * ```ts
 * // minDebt 1k, borrow limit 100k, threshold ceiling 9x, deposit worth 10k
 * calcLeverageBand({ sdk, creditManager, collateral }) // { min: 1.1, max: 9 }
 * ```
 **/
export function calcLeverageBand({
  sdk,
  creditManager,
  collateral,
  targetHF,
  position,
}: LeverageBandProps): LeverageBand | undefined {
  // The register throws for a manager it does not know, and a form asks this
  // on every keystroke — including before the SDK has finished attaching. A
  // question it cannot answer yet is not an error.
  const found = resolveCreditManager(sdk, creditManager);
  if (!found) {
    return undefined;
  }
  const { suite, market } = found;

  const strategy = suite.strategy;
  if (!strategy) {
    return undefined;
  }
  const target = strategy.targetCollateral;
  const ceiling = suite.creditManager.maxLeverage(target, targetHF);

  if (position) {
    if (!eq(position.creditManager, creditManager)) {
      throw new Error("credit account belongs to a different credit manager");
    }
    const creditAccount = {
      creditAccount: position.creditAccount,
      creditManager: position.creditManager,
      creditFacade: suite.creditFacade.address,
      underlying: position.underlyingToken.address,
      enabledTokensMask: 0n,
      totalDebtUSD: 0n,
      totalDebt: position.totalDebt.value,
      tokens: position.collaterals.map(({ collateral, quota }) => ({
        token: collateral.token.address,
        mask: 0n,
        balance: collateral.value,
        quota: quota.value,
        success: true,
      })),
    };
    const view = {
      ...accountView(creditAccount, sdk),
      collateral: position.totalValue.value - position.totalDebt.value,
    };
    const { leverageLimits, quotaLimits } = strategyLimits({
      type: "ADJUST_LEVERAGE",
      suite,
      view,
      initialQuotas: creditAccount.tokens,
      token: target,
      targetLeverage: LEVERAGE_DECIMALS,
      quotaReserve: undefined,
    });
    if (!leverageLimits) return undefined;
    const min = Number(leverageLimits.min) / Number(LEVERAGE_DECIMALS);
    const max = Math.min(
      ceiling,
      Number(
        BigIntMath.min(
          leverageLimits.max,
          quotaLimits?.leverageMax ?? leverageLimits.max,
        ),
      ) / Number(LEVERAGE_DECIMALS),
    );
    return min > max ? undefined : { min, max };
  }

  const underlying = market.pool.underlying;
  const convert: ConvertFn = (from, to, amount) =>
    market.priceOracle.safeConvert(from, to, amount).value;
  const netValue = collateral.reduce(
    (acc, a) => acc + convert(a.token, underlying, a.balance),
    0n,
  );
  // Nothing deposited yet rules nothing out: the whole track is on offer until
  // a size is named, and it narrows on the first keystroke.
  if (netValue <= 0n) {
    return { min: 1, max: ceiling };
  }

  const { minDebt } = suite.creditFacade;
  const borrowLimit = strategy.maxBorrowAmount().amount.value;

  const floor = BigIntMath.ceilDiv(LEVERAGE_DECIMALS * minDebt, netValue);
  // Forward debt truncates, so invert the exclusive next debt unit.
  const roof =
    BigIntMath.ceilDiv(LEVERAGE_DECIMALS * (borrowLimit + 1n), netValue) - 1n;

  // Only the hundredths cross into floating point; the operands above are
  // token amounts, which an 18-decimal balance takes past what a double holds.
  const min = 1 + Number(floor) / Number(LEVERAGE_DECIMALS);
  const max = Math.min(ceiling, 1 + Number(roof) / Number(LEVERAGE_DECIMALS));

  // Nothing to offer: the smallest debt this market accepts is more than the
  // deposit can carry, or the manager has no room left for it.
  return min > max ? undefined : { min, max };
}
