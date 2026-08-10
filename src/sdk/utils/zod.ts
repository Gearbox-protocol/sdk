import { type Address, getAddress, type Hex, isAddress, isHex } from "viem";
import { z } from "zod/v4";

/**
 * Like Address from abitype/zod, but converts an address into an address that is checksum encoded.
 */
export const ZodAddress = (): z.ZodPipe<
  z.ZodString,
  z.ZodTransform<Address, string>
> =>
  z.string().transform((val, ctx): Address => {
    if (!isAddress(val)) {
      ctx.issues.push({
        code: "custom",
        message: `invalid address ${val}`,
        input: ctx.value,
      });
    }

    return getAddress(val);
  });

/**
 * A `0x`-prefixed hex string, as viem's Hex.
 */
export const ZodHex = (): z.ZodPipe<z.ZodString, z.ZodTransform<Hex, string>> =>
  z.string().transform((val, ctx): Hex => {
    if (!isHex(val)) {
      ctx.issues.push({
        code: "custom",
        message: `invalid hex string ${val}`,
        input: ctx.value,
      });
    }

    return val as Hex;
  });
