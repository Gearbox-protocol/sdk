import { getAddress, isAddress } from "viem";
import { z } from "zod/v4";

/**
 * Like Address from abitype/zod, but converts an address into an address that is checksum encoded.
 */
export const ZodAddress = () =>
  z.string().transform((val, ctx) => {
    if (!isAddress(val)) {
      ctx.issues.push({
        code: "custom",
        message: `invalid address ${val}`,
        input: ctx.value,
      });
    }

    return getAddress(val);
  });
