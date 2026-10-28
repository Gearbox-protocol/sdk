import { type Address, isAddress } from "viem";
import { z } from "zod/v4";

/**
 * Runtime schemas shared by the {@link GearboxPermissionless} namespaces.
 *
 * Addresses are validated but never rewritten: the backend serves them in the
 * case its database holds, and its payloads key records by address, so
 * checksumming here would silently break a lookup by the key it answered with.
 * A caller that needs one form converts with viem's `getAddress`.
 **/

/** An address, in whatever case the backend serves it. */
export const addressSchema = z.custom<Address>(
  value => typeof value === "string" && isAddress(value, { strict: false }),
  { message: "invalid address" },
);

/**
 * A record keyed by address. Spelled out here because zod types a record key
 * by the schema's output, which the branded `Address` is not inferred as.
 **/
export function addressRecord<V extends z.ZodType>(
  value: V,
): z.ZodType<Record<Address, z.output<V>>> {
  const key = z.string().refine(v => isAddress(v, { strict: false }), {
    message: "invalid address",
  });
  return z.record(key, value) as unknown as z.ZodType<
    Record<Address, z.output<V>>
  >;
}
