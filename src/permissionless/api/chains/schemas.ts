import { z } from "zod/v4";

/**
 * Runtime schema for {@link PermissionlessChain}.
 **/
export const chainSchema = z.looseObject({
  chainId: z.number(),
  name: z.string(),
  isPublic: z.boolean(),
  isActivated: z.boolean(),
  explorerUrl: z.string(),
});

/** What `GET /chain/list` answers with. */
export const chainListSchema = z.array(chainSchema);

/**
 * Runtime schema for {@link PermissionlessChainSummary}.
 *
 * Strict about the two counters on purpose: they are the only reason this
 * read exists, and a backend that answered without them would render as
 * dashes where the numbers belong — a skew worth failing on rather than
 * displaying.
 **/
export const chainSummarySchema = chainSchema.extend({
  riskCuratorsQty: z.number(),
  marketsQty: z.number(),
});

/** What `GET /chain/summary` answers with. */
export const chainSummaryListSchema = z.array(chainSummarySchema);
