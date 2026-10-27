import { type Address, type Hex, isHex, zeroAddress } from "viem";
import { z } from "zod/v4";

// Define Primitive type for Zod v4 compatibility - only types that work with z.literal()
type Primitive = string | number | boolean | bigint;

// Validation schemas
export const addressSchema = z
  .string()
  .min(42, "Ethereum address must be 42 characters long")
  .max(42, "Ethereum address must be 42 characters long")
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format") as z.ZodType<
  Address,
  string
>;

export const nonZeroAddressSchema = addressSchema.refine(
  data => data !== zeroAddress,
  {
    message: "Ethereum address must not be 0x000...000",
  },
);

export const bytes32IdSchema = z
  .string()
  .min(66, "Id must be 66 characters long")
  .max(66, "Id must be 66 characters long")
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid id format") as z.ZodType<Hex, string>;

/** Hex data of any byte length, e.g. ABI-encoded parameters. **/
export const hexSchema = z
  .string()
  .refine(value => isHex(value, { strict: true }), "Invalid hex string")
  .refine(
    value => value.length % 2 === 0,
    "Hex data must have an even number of digits",
  ) as z.ZodType<Hex, string>;

export const numberSchema = z.number();

export const positiveNumberSchema = z.number().refine(val => val > 0);

/** A finite amount that is zero or more, e.g. a debt or quota limit. **/
export const nonNegativeNumberSchema = z
  .number()
  .finite()
  .min(0, "Must not be negative");

/** A nonnegative decimal written out in full, e.g. `"0.000001"`. **/
export const DECIMAL_STRING = /^\d+(?:\.\d+)?$/;

/** A token amount: a number, or a decimal string for an exact value. **/
export const tokenAmountSchema = z.union([
  nonNegativeNumberSchema,
  z.string().regex(DECIMAL_STRING),
]);

/**
 * An integer that fits the Solidity `uint<bits>` it is encoded as.
 *
 * Limited to 48 bits: anything wider exceeds `Number.MAX_SAFE_INTEGER` and
 * has to be a `bigint` instead.
 **/
export function uintSchema(bits: number) {
  if (!Number.isInteger(bits) || bits < 1 || bits > 48) {
    throw new Error(`uint${bits} does not fit a JavaScript number`);
  }
  const max = 2 ** bits - 1;
  return z
    .number()
    .int("Must be an integer")
    .min(0, "Must not be negative")
    .max(max, `Must fit in uint${bits} (at most ${max})`);
}

/** The four liquidation fees of a credit manager, in percent. **/
interface LiquidationFees {
  feeLiquidation: number;
  feeLiquidationPremium: number;
  feeLiquidationExpired: number;
  feeLiquidationPremiumExpired: number;
}

/**
 * The fee relations `CreditConfiguratorV3.setFees` and credit suite creation
 * enforce; a violation reverts with `IncorrectParameterException`.
 **/
export function refineLiquidationFees(
  fees: LiquidationFees,
  ctx: z.RefinementCtx,
): void {
  const fail = (path: keyof LiquidationFees, message: string) =>
    ctx.addIssue({ code: "custom", path: [path], message });

  if (fees.feeLiquidation > fees.feeLiquidationPremium) {
    fail(
      "feeLiquidation",
      "Invalid fees: liquidation fee must not exceed the liquidation premium",
    );
  }
  if (fees.feeLiquidationExpired > fees.feeLiquidationPremiumExpired) {
    fail(
      "feeLiquidationExpired",
      "Invalid fees: expired liquidation fee must not exceed the expired liquidation premium",
    );
  }
  if (fees.feeLiquidationExpired > fees.feeLiquidation) {
    fail(
      "feeLiquidationExpired",
      "Invalid fees: expired liquidation fee must not exceed the liquidation fee",
    );
  }
  if (fees.feeLiquidationPremiumExpired > fees.feeLiquidationPremium) {
    fail(
      "feeLiquidationPremiumExpired",
      "Invalid fees: expired liquidation premium must not exceed the liquidation premium",
    );
  }
  if (fees.feeLiquidationPremium + fees.feeLiquidation >= 100) {
    fail(
      "feeLiquidationPremium",
      "Invalid fees: liquidation fee and premium must be less than 100% in total",
    );
  }
}

export const percentageSchema = z
  .number()
  .min(0, "Percentage must be positive")
  .max(100, "Percentage cannot exceed 100%")
  .transform(value => Math.round(value * 100) / 100);

export const nonEmptyStringSchema = z.string().min(3, "String cannot be empty");

export const minorVersionSchema = z.number().refine(
  val => val === 310, // || val === 320,
  "Minor version must be 310",
  // "Minor version must be either 310 or 320"
);

// Validation functions
export const isValidNumber = (value: string): boolean => {
  return (
    !Number.isNaN(Number(value)) && value.trim() !== "" && Number(value) >= 0
  );
};

export const isValidEthereumAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidBytes32 = (bytes32: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(bytes32);
};

/** One of the given literals; its output type is their union. **/
export const literalsSchema = <
  const T extends readonly [Primitive, ...Primitive[]],
>(
  ...vals: T
): z.ZodType<T[number], T[number]> => {
  const schemas = vals.map(v => z.literal(v)) as unknown as [
    z.ZodTypeAny,
    z.ZodTypeAny,
    ...z.ZodTypeAny[],
  ];
  return z.union(schemas) as unknown as z.ZodType<T[number], T[number]>;
};
