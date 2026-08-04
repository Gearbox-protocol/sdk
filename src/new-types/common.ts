import { getAddress, isAddress, isHex } from "viem";
import { z } from "zod";

import type {
  Address,
  Amount,
  AssetClass,
  BlockNumber,
  ChainId,
  Hex,
  NonNegativeIntegerString,
  OpportunityId,
  PoolId,
  Rate,
  Ratio,
  SignedAmount,
  SignedIntegerString,
  StrategyId,
  Timestamp,
  Token,
} from "./types.js";

// ---------------------------------------------------------------------------
// Numeric primitives
// ---------------------------------------------------------------------------

export const chainIdSchema = z
  .number()
  .int()
  .positive() satisfies z.ZodType<ChainId>;

export const timestampSchema = z
  .number()
  .int()
  .nonnegative() satisfies z.ZodType<Timestamp>;

export const finiteNumberSchema = z
  .number()
  .finite() satisfies z.ZodType<number>;

export const nonNegativeNumberSchema =
  finiteNumberSchema.nonnegative() satisfies z.ZodType<number>;

/** Decimal fraction: 0.05 means 5%. Negative rates remain representable. */
export const rateSchema = finiteNumberSchema satisfies z.ZodType<Rate>;

/** Decimal fraction constrained to 0..1: 0.9 means 90%. */
export const ratioSchema = finiteNumberSchema
  .min(0)
  .max(1) satisfies z.ZodType<Ratio>;

export const nonNegativeIntegerStringSchema = z
  .string()
  .regex(
    /^\d+$/,
    "Expected a non-negative base-10 integer",
  ) satisfies z.ZodType<NonNegativeIntegerString>;

export const signedIntegerStringSchema = z
  .string()
  .regex(
    /^-?\d+$/,
    "Expected a signed base-10 integer",
  ) satisfies z.ZodType<SignedIntegerString>;

export const blockNumberSchema = z
  .bigint()
  .nonnegative() satisfies z.ZodType<BlockNumber>;

export const addressSchema = z
  .string()
  .refine(isAddress, "Invalid Ethereum address")
  .transform(
    value => getAddress(value) as Address,
  ) satisfies z.ZodType<Address>;

export const hexSchema = z.custom<Hex>(
  (value): value is Hex => typeof value === "string" && isHex(value),
  "Invalid hexadecimal data",
) satisfies z.ZodType<Hex>;

// ---------------------------------------------------------------------------
// Amounts and tokens
// ---------------------------------------------------------------------------

/** Final display amount. Sizes are non-negative; deltas use `signedAmountSchema`. */
export const amountSchema = z.object({
  value: nonNegativeNumberSchema,
  usd: nonNegativeNumberSchema.nullable(),
}) satisfies z.ZodType<Amount>;

/** Exact signed token delta. Write models only. */
export const signedAmountSchema = z.object({
  /** Exact signed token delta in base units. */
  raw: signedIntegerStringSchema,
  decimals: z.number().int().min(0).max(255),
  value: finiteNumberSchema,
  usd: finiteNumberSchema.nullable(),
}) satisfies z.ZodType<SignedAmount>;

export const tokenSchema = z.object({
  chainId: chainIdSchema,
  address: addressSchema,
  symbol: z.string().trim().min(1),
  decimals: z.number().int().min(0).max(255),
  /** May be an absolute URL or an application-owned asset path. */
  iconUrl: z.string().trim().min(1).nullable(),
}) satisfies z.ZodType<Token>;

export const assetClassSchema = z.enum([
  "stable",
  "eth",
  "btc",
  "other",
]) satisfies z.ZodType<AssetClass>;

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

function parseRawPoolId(value: string) {
  const [rawChainId, rawPoolAddress, extra] = value.split(":");
  const chainId = Number(rawChainId);

  if (extra !== undefined || !chainIdSchema.safeParse(chainId).success) {
    return null;
  }

  const poolAddress = addressSchema.safeParse(rawPoolAddress);

  return poolAddress.success
    ? { chainId, poolAddress: poolAddress.data }
    : null;
}

function parseRawStrategyId(value: string) {
  const [rawChainId, rawCreditManager, rawTargetCollateral, extra] =
    value.split(":");
  const chainId = Number(rawChainId);

  if (extra !== undefined || !chainIdSchema.safeParse(chainId).success) {
    return null;
  }

  const creditManagerAddress = addressSchema.safeParse(rawCreditManager);
  const targetCollateralAddress = addressSchema.safeParse(rawTargetCollateral);

  return creditManagerAddress.success && targetCollateralAddress.success
    ? {
        chainId,
        creditManagerAddress: creditManagerAddress.data,
        targetCollateralAddress: targetCollateralAddress.data,
      }
    : null;
}

export function createPoolId(chainId: number, poolAddress: Address): PoolId {
  return `${chainIdSchema.parse(chainId)}:${addressSchema.parse(poolAddress)}`;
}

/**
 * Strategy identity is creditManager + targetCollateral; this composite string
 * is only its route/key encoding.
 */
export function createStrategyId(
  chainId: number,
  creditManagerAddress: Address,
  targetCollateralAddress: Address,
): StrategyId {
  return `${chainIdSchema.parse(chainId)}:${addressSchema.parse(
    creditManagerAddress,
  )}:${addressSchema.parse(targetCollateralAddress)}`;
}

export const poolIdSchema = z
  .string()
  .superRefine((value, ctx) => {
    if (!parseRawPoolId(value)) {
      ctx.addIssue({ code: "custom", message: "Invalid pool opportunity ID" });
    }
  })
  .transform(value => {
    const parsed = parseRawPoolId(value);

    if (!parsed) {
      throw new Error("Pool ID passed refinement but could not be parsed");
    }

    return createPoolId(parsed.chainId, parsed.poolAddress);
  }) satisfies z.ZodType<PoolId>;

export const strategyIdSchema = z
  .string()
  .superRefine((value, ctx) => {
    if (!parseRawStrategyId(value)) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid strategy opportunity ID",
      });
    }
  })
  .transform(value => {
    const parsed = parseRawStrategyId(value);

    if (!parsed) {
      throw new Error("Strategy ID passed refinement but could not be parsed");
    }

    return createStrategyId(
      parsed.chainId,
      parsed.creditManagerAddress,
      parsed.targetCollateralAddress,
    );
  }) satisfies z.ZodType<StrategyId>;

export const opportunityIdSchema = z.union([
  poolIdSchema,
  strategyIdSchema,
]) satisfies z.ZodType<OpportunityId>;

export function parsePoolId(id: PoolId) {
  const parsed = parseRawPoolId(poolIdSchema.parse(id));

  if (!parsed) {
    throw new Error("Validated pool ID could not be parsed");
  }

  return parsed;
}

export function parseStrategyId(id: StrategyId) {
  const parsed = parseRawStrategyId(strategyIdSchema.parse(id));

  if (!parsed) {
    throw new Error("Validated strategy ID could not be parsed");
  }

  return parsed;
}
