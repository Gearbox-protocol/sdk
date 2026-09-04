import { type Address, getAddress, type Hex, isAddress, isHex } from "viem";
import { z } from "zod/v4";

/**
 * A `bigint` codec that serializes into string, deserializes into bigint.
 */
export const ZodBigInt = (): z.ZodCodec<
  z.ZodUnion<[z.ZodString, z.ZodBigInt]>,
  z.ZodBigInt
> =>
  z.codec(
    z.union([z.string().regex(z.regexes.integer), z.bigint()]),
    z.bigint(),
    {
      decode: value => (typeof value === "bigint" ? value : BigInt(value)),
      encode: value => value.toString(),
    },
  );

const addressOut = z.custom<Address>(
  val => typeof val === "string" && isAddress(val, { strict: false }),
);

/**
 * Like Address from abitype/zod, but converts an address into an address that is checksum encoded.
 */
export const ZodAddress = (): z.ZodCodec<
  z.ZodString,
  z.ZodCustom<Address, Address>
> =>
  z.codec(z.string(), addressOut, {
    decode: (val, ctx): Address => {
      if (!isAddress(val, { strict: false })) {
        ctx.issues.push({
          code: "custom",
          message: `invalid address ${val}`,
          input: val,
        });
        return z.NEVER;
      }

      return getAddress(val);
    },
    encode: (address): string => address,
  });

const hexOut = z.custom<Hex>(val => typeof val === "string" && isHex(val));

/**
 * A `0x`-prefixed hex string, as viem's Hex.
 */
export const ZodHex = (): z.ZodCodec<z.ZodString, z.ZodCustom<Hex, Hex>> =>
  z.codec(z.string(), hexOut, {
    decode: (val, ctx): Hex => {
      if (!isHex(val)) {
        ctx.issues.push({
          code: "custom",
          message: `invalid hex string ${val}`,
          input: val,
        });
        return z.NEVER;
      }

      return val;
    },
    encode: (hex): string => hex,
  });
