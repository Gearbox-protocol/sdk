import { z } from "zod/v4";

/**
 * Runtime schema for {@link PermissionlessChain}.
 *
 * Strict about the two counters on purpose: `GET /chain/list` used to answer
 * with raw chain rows and only later grew the summary shape, and the older
 * version is missing exactly those. A list rendered off it would show dashes
 * where the numbers belong, which is a skew worth failing on rather than
 * displaying.
 **/
export const chainSchema = z.looseObject({
  chainId: z.number(),
  name: z.string(),
  isPublic: z.boolean(),
  isActivated: z.boolean(),
  explorerUrl: z.string(),
  riskCuratorsQty: z.number(),
  marketsQty: z.number(),
});

/** What `GET /chain/list` answers with. */
export const chainListSchema = z.array(chainSchema);
