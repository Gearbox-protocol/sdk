import { type Address, isAddressEqual } from "viem";
import type { CreditAccountData } from "../../base/index.js";
import { NON_STRATEGY_PHANTOM_TOKEN_TYPES } from "../../base/token-types.js";
import { DUST_THRESHOLD, PERCENTAGE_FACTOR } from "../../constants/index.js";
import type { MarketSuite } from "../MarketSuite.js";

const NON_STRATEGY_PHANTOM_TOKEN_TYPE_SET: ReadonlySet<string> = new Set(
  NON_STRATEGY_PHANTOM_TOKEN_TYPES,
);

const RWA_UNDERLYING_PREFIX = "RWA_UNDERLYING::";

/**
 * Inputs of {@link isStrategyCollateral} and {@link pickStrategyTargetCollateral},
 * all resolved against the credit manager, market, and token metadata by the
 * caller.
 */
export interface StrategyCollateralProps {
  /**
   * Candidate collateral token.
   **/
  token: Address;
  /**
   * Credit manager underlying (debt asset).
   **/
  underlying: Address;
  /**
   * Token the market's underlying wraps (same as `underlying` on non-RWA
   * markets).
   */
  unwrappedUnderlying: Address;
  /**
   * Liquidation threshold of the token in this credit manager, in bps.
   **/
  liquidationThreshold: number;
  /**
   * Gearbox contract type of the token (e.g. `"PHANTOM_TOKEN::CONVEX"`).
   * Optional — plain tokens have none.
   */
  contractType?: string;
  /**
   * Whether the token itself is expired (e.g. a matured Pendle PT). Optional
   * — treated as not expired when absent.
   */
  isExpired?: boolean;
  /**
   * Latest main oracle price for the token in USD (8 decimals), `undefined`
   * when there is no feed. A failed answer is `0` — PriceFeedCompressor
   * guarantees `price == 0` when `success == false`.
   */
  mainPrice?: bigint;
  /**
   * Whether the market still accepts quota for the token.
   **/
  hasActiveQuota: boolean;
}

/**
 * Whether a collateral token can be the target of a leveraged strategy.
 *
 * A token qualifies when it
 *
 * - has a liquidation threshold above `0` and below `100%`, and is not the
 *   suite's underlying — borrowing an asset against itself is not a position,
 *   and an LT of `0` or at least `100%` would mean unbounded leverage;
 * - is not the token the market's underlying wraps, which for an RWA market
 *   is the same exposure as the underlying itself (also rejected when
 *   `contractType` starts with `"RWA_UNDERLYING::"`);
 * - is not a withdrawal or redemption phantom token listed in
 *   {@link NON_STRATEGY_PHANTOM_TOKEN_TYPES} — those only ever appear as the
 *   intermediate step of a withdrawal and cannot be acquired;
 * - is not an expired token, e.g. a matured Pendle PT;
 * - has a non-zero main price in the market's oracle — a zero or missing
 *   answer (e.g. a failed or zero price feed) means the position cannot be
 *   valued.
 *
 * Pass `requireQuota` as `true` to also require that the market still accepts
 * quota for the token.
 */
export function isStrategyCollateral(
  {
    token,
    underlying,
    unwrappedUnderlying,
    liquidationThreshold,
    contractType,
    isExpired,
    mainPrice,
    hasActiveQuota,
  }: StrategyCollateralProps,
  requireQuota = false,
): boolean {
  if (
    isAddressEqual(token, underlying) ||
    isAddressEqual(token, unwrappedUnderlying)
  ) {
    return false;
  }
  if (
    liquidationThreshold <= 0 ||
    liquidationThreshold >= Number(PERCENTAGE_FACTOR)
  ) {
    return false;
  }
  if (
    contractType &&
    (NON_STRATEGY_PHANTOM_TOKEN_TYPE_SET.has(contractType) ||
      contractType.startsWith(RWA_UNDERLYING_PREFIX))
  ) {
    return false;
  }
  if (isExpired) {
    return false;
  }
  if (!mainPrice) {
    return false;
  }
  return !requireQuota || hasActiveQuota;
}

/**
 * Picks the single strategy target from a credit manager's collateral list.
 *
 * Walks {@link tokens} from the end (biggest index first) and returns the
 * first token that {@link isStrategyCollateral} accepts with quota required.
 * If none has an active quota, returns the biggest-index candidate that
 * qualifies without quota. `undefined` when nothing qualifies. A hardcoded
 * legacy mapping, when present, is applied by the caller before this function.
 **/
export function pickStrategyTargetCollateral(
  tokens: StrategyCollateralProps[],
): Address | undefined {
  let quotaless: Address | undefined;
  for (let i = tokens.length - 1; i >= 0; i--) {
    const props = tokens[i];
    if (!isStrategyCollateral(props)) {
      continue;
    }
    if (isStrategyCollateral(props, true)) {
      return props.token;
    }
    quotaless ??= props.token;
  }
  return quotaless;
}

/**
 * The account's dominant collateral: the most valuable enabled non-underlying
 * token it holds above dust, by USD value.
 *
 * Used to pick the collateral a partial liquidation seizes by default.
 *
 * @param account - Account to inspect.
 * @param market - Market of the account, whose oracle prices the candidates.
 * @returns The dominant collateral, or `undefined` when the account holds
 * nothing but its underlying, or nothing the oracle can price.
 **/
export function dominantCollateral(
  account: CreditAccountData,
  market: MarketSuite,
): Address | undefined {
  let bestValue = 0;
  let dominant: Address | undefined;
  for (const t of account.tokens) {
    if (
      isAddressEqual(t.token, account.underlying) ||
      (t.mask & account.enabledTokensMask) === 0n ||
      t.balance <= DUST_THRESHOLD
    ) {
      continue;
    }
    // a token the oracle cannot price does not win the comparison
    const value = market.priceOracle.safeUsdValue(t.token, t.balance) ?? 0;
    if (value > bestValue) {
      bestValue = value;
      dominant = t.token;
    }
  }
  return dominant;
}
