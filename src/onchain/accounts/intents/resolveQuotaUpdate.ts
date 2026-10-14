import type { Address } from "viem";
import type { OperationLimitOptions } from "../../../model/index.js";
import type { Asset } from "../../base/types.js";
import {
  MAX_QUOTA_MULTIPLIER,
  MIN_INT96,
  PERCENTAGE_FACTOR,
} from "../../constants/math.js";
import type { ConvertFn } from "../../market/oracle/types.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import {
  checkForbiddenToken,
  checkMaxQuota,
  checkQuotaActive,
  checkQuotaChange,
  checkQuotaLimit,
  raise,
  toToken,
} from "../../validation/index.js";
import { roundUpQuota } from "../quota-utils.js";
import { assertQuotaAvailable } from "./guards.js";
import type { QuotaUpdateState } from "./operations.js";
import type { CreditAccountSlice } from "./types.js";
import { eq } from "./utils/common.js";
import { resizedQuota } from "./utils/quotas-for-update.js";

export interface ResolveQuotaUpdateProps {
  sdk: OnchainSDK;
  creditAccount: Pick<CreditAccountSlice, "creditManager"> & {
    tokens: ReadonlyArray<
      Pick<CreditAccountSlice["tokens"][number], "token" | "balance" | "quota">
    >;
  };
  token: Address;
  /** Target in underlying units; `undefined` sizes it to the balance. */
  quota: bigint | undefined;
  quotaReserve: number | undefined;
  limits?: OperationLimitOptions;
}

export interface ResolvedQuotaUpdate {
  update: QuotaUpdateState;
  /** Passed to the facade as the quota the token must end at or above. */
  minQuota: Asset[];
}

interface QuotaChange {
  /** The requested quota, before any cap or rounding. */
  requested: bigint;
  /** What is sent: a `PERCENTAGE_FACTOR` multiple, or `MIN_INT96`. */
  change: bigint;
  resulting: bigint;
  minQuota: bigint;
}

/**
 * Synchronous calculation from the SDK's loaded market state; no RPC reads.
 * @throws IntentPreviewError when quota validation rejects the change.
 *
 * The single `updateQuota` an `UPDATE_QUOTA` intent sends, checked against
 * what the facade and the quota keeper would revert on.
 *
 * A target is taken as named and refused when the market cannot meet it. A
 * sized quota is held to what the market can give instead: an increase is capped
 * at the pool's available quota, and `minQuota` accepts a partial fill so long as the
 * token stays enabled.
 */
export function resolveQuotaUpdate(
  props: ResolveQuotaUpdateProps,
): ResolvedQuotaUpdate {
  const { sdk, creditAccount, quotaReserve, limits } = props;
  const suite = sdk.marketRegister.findCreditManager(
    creditAccount.creditManager,
  );
  const { market } = suite;
  const { pqk } = market.pool;
  const tokenLc = props.token.toLowerCase() as Address;
  const token = toToken(sdk, tokenLc);
  const underlying = toToken(sdk, market.pool.underlying);
  const current =
    creditAccount.tokens.find(t => eq(t.token, tokenLc))?.quota ?? 0n;

  raise(
    checkQuotaActive({
      token,
      isActive: pqk.quotas.get(tokenLc)?.isActive ?? false,
    }),
    `updateQuota: ${tokenLc} has no active quota`,
  );

  let resolved: QuotaChange;
  if (props.quota === undefined) {
    const price: ConvertFn = (from, to, amount) =>
      market.priceOracle.safeConvert(from, to, amount).value;
    const sized = resizedQuota({
      token: tokenLc,
      assets: creditAccount.tokens,
      initialQuotas: creditAccount.tokens,
      quotaReserve,
      underlyingToken: market.pool.underlying,
      liquidationThresholds: suite.creditManager.liquidationThresholds,
      quotas: pqk.quotas,
      maxDebt: suite.creditFacade.maxDebt,
      convert: price,
    });
    resolved = sizedChange(
      current,
      sized,
      tokenLc,
      roundUpQuota(pqk.quotaAvailable(tokenLc)),
    );
    if (resolved.change === 0n && resolved.requested > current) {
      raise(
        checkQuotaLimit({
          token,
          requested: resolved.requested - current,
          available: 0n,
          ...limits,
          underlying,
        }),
        `updateQuota: the pool has no quota left for ${tokenLc}`,
      );
    }
  } else {
    resolved = targetChange(current, props.quota);
  }
  const { requested, change, resulting } = resolved;

  raise(
    checkQuotaChange({ token, current, requested, change, underlying }),
    `updateQuota: ${requested} rounds to the current ${current}`,
  );
  if (change > 0n) {
    raise(
      checkForbiddenToken({ token, isForbidden: suite.isForbidden(tokenLc) }),
      `updateQuota: ${tokenLc} is forbidden, its quota cannot grow`,
    );
  }
  if (props.quota !== undefined) {
    const maxQuota = MAX_QUOTA_MULTIPLIER * suite.creditFacade.maxDebt;
    raise(
      checkMaxQuota({ token, requested: resulting, maxQuota, underlying }),
      `updateQuota: ${resulting} exceeds maxQuota ${maxQuota}`,
    );
    if (change > 0n) {
      assertQuotaAvailable(
        sdk,
        market,
        [{ token: tokenLc, balance: change }],
        limits,
      );
    }
  }

  const entry: Asset = { token: tokenLc, balance: change };
  return {
    update: {
      desiredQuota: { [tokenLc]: { token: tokenLc, balance: resulting } },
      quotaIncrease: change > 0n ? [entry] : [],
      quotaDecrease: change < 0n ? [entry] : [],
    },
    minQuota: [{ token: tokenLc, balance: resolved.minQuota }],
  };
}

function targetChange(current: bigint, quota: bigint): QuotaChange {
  const target = BigIntMath.max(quota, 0n);
  if (target === 0n) {
    return {
      requested: 0n,
      change: current > 0n ? MIN_INT96 : 0n,
      resulting: 0n,
      minQuota: 0n,
    };
  }
  const change = roundUpQuota(target - current);
  return {
    requested: target,
    change,
    resulting: current + change,
    minQuota: current + change,
  };
}

/**
 * Reads the one token's change back out of {@link resizedQuota}, then caps an
 * increase at `available`.
 */
function sizedChange(
  current: bigint,
  sized: QuotaUpdateState,
  token: Address,
  available: bigint,
): QuotaChange {
  const requested = sized.desiredQuota[token]?.balance ?? current;
  const decrease = sized.quotaDecrease.find(a => a.token === token)?.balance;
  if (decrease !== undefined) {
    const resulting = decrease === MIN_INT96 ? 0n : current + decrease;
    return { requested, change: decrease, resulting, minQuota: resulting };
  }
  const increase = BigIntMath.min(
    sized.quotaIncrease.find(a => a.token === token)?.balance ?? 0n,
    available,
  );
  return {
    requested,
    change: increase,
    resulting: current + increase,
    minQuota:
      increase > 0n ? BigIntMath.max(current, PERCENTAGE_FACTOR) : current,
  };
}
