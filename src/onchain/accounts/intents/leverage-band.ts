import type { Address } from "viem";
import type { Bps, Leverage } from "../../../model/index.js";
import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import type { Asset, OnchainSDK } from "../../index.js";
import type { ConvertFn } from "../../market/oracle/types.js";
import { BigIntMath } from "../../utils/bigint-math.js";

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
   * What stands behind the position: the tokens being deposited when opening
   * one, or its own net value when adjusting one. Priced into the market's
   * underlying here, so a caller hands over amounts and no exchange rates.
   **/
  readonly collateral: readonly Asset[];
  /**
   * Health factor the maxed leverage should leave the position at, in basis
   * points. Omitted keeps `calcMaxLeverage` on its flat buffer.
   **/
  readonly targetHF?: Bps;
}

/**
 * The leverages this market will actually fund for a position of this size.
 *
 * A credit manager's `maxLeverage` follows from the liquidation threshold
 * alone, so it is the same for a hundred dollars and for a million. What a
 * given deposit reaches is decided by the debt it implies —
 * `debt = netValue × (leverage − 1)` — and by the band the market puts that
 * debt in. This inverts that relation.
 *
 * Rounding is asymmetric because the forward direction truncates: the floor
 * rounds **up** so the leverage it names really does clear `minDebt`, and the
 * ceiling rounds **down** so it really does stay under the borrow limit.
 *
 * Nothing here is fetched or simulated — every input is loaded market state,
 * so a form can call this on each keystroke.
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
}: LeverageBandProps): LeverageBand | undefined {
  // The register throws for a manager it does not know, and a form asks this
  // on every keystroke — including before the SDK has finished attaching. A
  // question it cannot answer yet is not an error.
  const found = resolve(sdk, creditManager);
  if (!found) {
    return undefined;
  }
  const { suite, market } = found;

  const target = suite.strategyTargetCollateral;
  if (!target) {
    return undefined;
  }
  const ceiling = suite.creditManager.maxLeverage(target, targetHF);
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

  const { minDebt, maxDebt } = suite.creditFacade;
  // What this manager may still draw, not what the pool happens to hold: the
  // pool's free liquidity is shared, this allowance is the manager's own. A
  // manager the pool has no entry for is simply uncapped by this term.
  const available = market.pool.pool.creditManagerDebtParams.get(
    suite.creditManager.address,
  )?.available;
  const borrowLimit =
    available === undefined ? maxDebt : BigIntMath.min(maxDebt, available);

  const floor = BigIntMath.ceilDiv(LEVERAGE_DECIMALS * minDebt, netValue);
  const roof = (LEVERAGE_DECIMALS * borrowLimit) / netValue;

  // Only the hundredths cross into floating point; the operands above are
  // token amounts, which an 18-decimal balance takes past what a double holds.
  const min = 1 + Number(floor) / Number(LEVERAGE_DECIMALS);
  const max = Math.min(ceiling, 1 + Number(roof) / Number(LEVERAGE_DECIMALS));

  // Nothing to offer: the smallest debt this market accepts is more than the
  // deposit can carry, or the manager has no room left for it.
  return min > max ? undefined : { min, max };
}

/** The manager's suite and market, or nothing while they cannot be resolved. */
function resolve(sdk: OnchainSDK, creditManager: Address) {
  try {
    return {
      suite: sdk.marketRegister.findCreditManager(creditManager),
      market: sdk.marketRegister.findByCreditManager(creditManager),
    };
  } catch {
    return undefined;
  }
}
