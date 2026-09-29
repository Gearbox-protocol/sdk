import { zeroAddress } from "viem";
import { z } from "zod";

// Define Primitive type for Zod v4 compatibility - only types that work with z.literal()
type Primitive = string | number | boolean | bigint;

// Validation schemas
export const addressSchema = z
  .string()
  .min(42, "Ethereum address must be 42 characters long")
  .max(42, "Ethereum address must be 42 characters long")
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format");

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
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid id format");

export const numberSchema = z.number();

export const positiveNumberSchema = z.number().refine(val => val > 0);

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
  return !isNaN(Number(value)) && value.trim() !== "" && Number(value) >= 0;
};

export const isValidEthereumAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidBytes32 = (bytes32: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(bytes32);
};

export const literalsSchema = <T extends readonly [Primitive, ...Primitive[]]>(
  ...vals: T
) => {
  const schemas = vals.map(v => z.literal(v)) as unknown as [
    z.ZodTypeAny,
    z.ZodTypeAny,
    ...z.ZodTypeAny[],
  ];
  return z.union(schemas);
};
