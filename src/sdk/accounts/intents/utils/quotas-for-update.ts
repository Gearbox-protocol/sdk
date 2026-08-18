import type { Address } from "viem";
import {
  type CalcQuotaUpdateProps,
  calcQuotaUpdate,
} from "../../../../common-utils/utils/creditAccount/quota-utils.js";
import { MIN_INT96 } from "../../../constants/math.js";
import type { AddressMap, Asset } from "../../../index.js";
import { TypedObjectUtils } from "../../../utils/mappers.js";
import type { QuotaUpdateState } from "../operations.js";
import type { ConvertFn } from "./ledger.js";

interface InitialQuota {
  token: Address;
  quota: bigint;
}

interface Quota {
  token: Address;
  rate: number;
  cumulativeIndexLU: bigint;
  quotaIncreaseFee: number;
  totalQuoted: bigint;
  limit: bigint;
  isActive: boolean;
}

interface GetQuotasForUpdateProps {
  assetsBefore: Asset[] | readonly Asset[];
  assetsAfter: Asset[];
  initialQuotas: Array<InitialQuota> | readonly InitialQuota[];
  quotaReserve: number | undefined;

  underlyingToken: Address;
  liquidationThresholds: AddressMap<number>;
  quotas: AddressMap<Quota>;
  maxDebt: bigint;
  convert: ConvertFn;
}

export function getQuotasForUpdate({
  assetsBefore,
  assetsAfter,
  initialQuotas,
  quotaReserve = 0,
  liquidationThresholds: liquidationThresholdsMap,
  quotas: quotasMap,
  maxDebt,
  underlyingToken,
  convert,
}: GetQuotasForUpdateProps): QuotaUpdateState {
  const underlyingTokenLc = underlyingToken.toLowerCase() as Address;
  const assetsBeforeLc = assetsBefore.map(
    (a): Asset => ({ ...a, token: a.token.toLowerCase() as Address }),
  );
  const assetsAfterLc = assetsAfter.map(
    (a): Asset => ({ ...a, token: a.token.toLowerCase() as Address }),
  );
  const { spend, obtain } = collectQuotaChange(assetsBeforeLc, assetsAfterLc);

  const initialQuotasLc = initialQuotas.map((a): [Address, InitialQuota] => {
    const tokenLc = a.token.toLowerCase() as Address;
    return [tokenLc, { ...a, token: tokenLc }];
  });
  const initialQuotasRecord = TypedObjectUtils.fromEntries(initialQuotasLc);

  const liquidationThresholds = TypedObjectUtils.fromEntries(
    liquidationThresholdsMap
      .entries()
      .map(([token, lt]): [Address, bigint] => [
        token.toLowerCase() as Address,
        BigInt(lt),
      ]),
  );

  const quotas = TypedObjectUtils.fromEntries(
    quotasMap
      .values()
      .map((q): [Address, CalcQuotaUpdateProps["quotas"][Address]] => {
        const token = q.token.toLowerCase() as Address;

        return [
          token,
          {
            token,
            rate: BigInt(q.rate),
            quotaIncreaseFee: BigInt(q.quotaIncreaseFee),
            totalQuoted: q.totalQuoted,
            limit: q.limit,
            isActive: q.isActive,
          },
        ];
      }),
  );

  const fullAssetsAfter = getBalancesAfterWithFullySpent(
    assetsAfterLc,
    spend,
    initialQuotasRecord,
  );

  const assetsWithAmountInTarget = fullAssetsAfter.map(
    (
      a,
    ): Asset & {
      amountInTarget: bigint;
    } => {
      return {
        ...a,
        amountInTarget: convert(a.token, underlyingTokenLc, a.balance),
      };
    },
  );

  const quotaResult = calcQuotaUpdate({
    quotas,
    initialQuotas: initialQuotasRecord,
    assetsAfterUpdate: constructAssetRecord(assetsWithAmountInTarget),
    allowedToObtain: constructAssetRecord(obtain),
    allowedToSpend: constructAssetRecord(spend),
    quotaReserve: BigInt(quotaReserve),
    maxDebt,
    liquidationThresholds,

    // "excess" mode is considered
    calcModification: undefined,
  });

  const quotaResultFiltered = filterQuotaUpdates(
    quotaResult.desiredQuota,
    quotaResult.quotaIncrease,
    quotaResult.quotaDecrease,
    [...new Set([...spend, ...obtain].map(q => q.token)).values()],
  );

  return quotaResultFiltered;
}

/**
 * The update that leaves the account holding no quota at all.
 *
 * Sits beside {@link getQuotasForUpdate} rather than inside it because the two
 * answer different questions: that one sizes quotas to the balances an
 * operation leaves behind, this one is asked for by a plan that ends the loan,
 * where the right size is none whatever the balances are.
 *
 * `MIN_INT96` is the protocol's "reset" sentinel, which is how a decrease says
 * "all of it" instead of naming an amount that interest may have moved.
 */
export function clearedQuotas(
  initialQuotas: Array<InitialQuota> | readonly InitialQuota[],
): QuotaUpdateState {
  const quoted = initialQuotas
    .filter(q => q.quota > 0n)
    .map(q => q.token.toLowerCase() as Address);

  return {
    desiredQuota: TypedObjectUtils.fromEntries(
      quoted.map((token): [Address, Asset] => [token, { token, balance: 0n }]),
    ),
    quotaIncrease: [],
    quotaDecrease: quoted.map(
      (token): Asset => ({ token, balance: MIN_INT96 }),
    ),
  };
}

function collectQuotaChange(
  assetsBefore: Asset[],
  assetsAfter: Asset[],
): { spend: Asset[]; obtain: Asset[] } {
  const before = new Map(assetsBefore.map(a => [a.token, a.balance]));
  const after = new Map(assetsAfter.map(a => [a.token, a.balance]));
  const tokens = new Set<Address>([...before.keys(), ...after.keys()]);

  const spend: Asset[] = [];
  const obtain: Asset[] = [];

  for (const token of tokens) {
    const delta = (after.get(token) ?? 0n) - (before.get(token) ?? 0n);
    if (delta > 0n) {
      obtain.push({ token, balance: delta });
    } else if (delta < 0n) {
      spend.push({ token, balance: -delta });
    }
  }

  return { spend, obtain };
}

/**
 * SDK `getSingleQuotaChange` requires `assetAfter` to emit quota decreases.
 * Simulation drops zero balances, so fully spent collaterals (e.g. claim
 * phantom) vanish — reinsert them with balance 0 when they still have
 * initial quota so `calcQuotaUpdate` can zero / remove that quota.
 */
function getBalancesAfterWithFullySpent(
  assetsAfter: Asset[],
  tokensSpend: Asset[],
  initialQuotas: Record<Address, { quota: bigint }>,
): Asset[] {
  const assetsAfterRecord = new Map(assetsAfter.map(a => [a.token, a]));

  for (const s of tokensSpend) {
    // token is still there, skip
    if (assetsAfterRecord.has(s.token)) {
      continue;
    }

    const initial = initialQuotas[s.token]?.quota ?? 0n;
    // token was fully spent, reinsert it with 0 balance
    if (initial > 0n) {
      assetsAfterRecord.set(s.token, { token: s.token, balance: 0n });
    }
  }

  return [...assetsAfterRecord.values()];
}

/**
 * Restricts quota updates to only tokens that were intended to change.
 */
function filterQuotaUpdates(
  desiredQuota: Record<Address, Asset>,
  quotaIncrease: Asset[],
  quotaDecrease: Asset[],
  tokensToUpdate: Address[],
): QuotaUpdateState {
  if (tokensToUpdate.length === 0) {
    return { desiredQuota: {}, quotaIncrease: [], quotaDecrease: [] };
  }

  const allowed = new Set(tokensToUpdate);
  const restrictedDesired: Record<Address, Asset> = {};
  for (const token of tokensToUpdate) {
    const asset = desiredQuota[token];
    if (asset) {
      restrictedDesired[token] = asset;
    }
  }

  return {
    desiredQuota: restrictedDesired,
    quotaIncrease: quotaIncrease.filter(a => allowed.has(a.token)),
    quotaDecrease: quotaDecrease.filter(a => allowed.has(a.token)),
  };
}

function constructAssetRecord<A extends Asset>(a: Array<A>) {
  const record = a.reduce<Record<Address, A>>((acc, asset) => {
    acc[asset.token] = asset;
    return acc;
  }, {});
  return record;
}
