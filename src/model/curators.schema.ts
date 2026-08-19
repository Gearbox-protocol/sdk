import { z } from "zod/v4";
import { ZodAddress } from "../sdk/utils/zod.js";
import { offchainOnly } from "./compare.schema.js";

/**
 * Runtime schemas for {@link ./curators.js}, see the note in
 * `primitives.schema.ts` on why they are written by hand.
 **/

/**
 * {@link CuratorName}
 **/
export const curatorNameSchema = z.enum([
  "Chaos Labs",
  "K3",
  "cp0x",
  "Re7",
  "Invariant Group",
  "Tulipa",
  "M11 Credit",
  "KPK",
  "Hyperithm",
  "UltraYield",
  "TelosC",
  "Gami Labs",
  "Securitize",
  "Testnet Curator",
]);

/**
 * {@link Curator}
 **/
export const curatorSchema = z.object({
  address: ZodAddress(),
  name: curatorNameSchema.optional(),
  url: offchainOnly(z.string().nullable()),
});
