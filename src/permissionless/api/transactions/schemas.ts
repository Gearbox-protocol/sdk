import { z } from "zod/v4";
import { addressSchema, hexSchema } from "../schemas.js";

/**
 * Runtime schemas around the batches.
 *
 * {@link instanceTxsSchema} guards what goes out, not what comes back: the
 * IPFS routes pin whatever JSON they are handed, and a malformed batch would
 * be pinned just as happily as a good one. It only asserts the frame — the
 * transactions inside carry whatever ABI metadata the call they encode has.
 **/

/** {@link ContractMethod} */
const contractMethodSchema = z.looseObject({
  inputs: z.array(z.unknown()),
  name: z.string(),
  payable: z.boolean(),
});

/** {@link SafeTx} */
const safeTxSchema = z.looseObject({
  to: z.string(),
  value: z.string(),
  data: hexSchema,
  contractMethod: contractMethodSchema,
  contractInputsValues: z.record(z.string(), z.string()),
});

/** {@link InstanceTxs} */
export const instanceTxsSchema = z.looseObject({
  chainId: z.number(),
  author: addressSchema,
  instanceManager: addressSchema,
  batches: z.array(z.array(safeTxSchema)),
  createdAtBlock: z.number().optional(),
  updatableFeeds: z.array(z.array(addressSchema)).optional(),
  safeAddress: addressSchema.optional(),
});

/** {@link InstanceTxsPreview} */
export const instanceTxsPreviewSchema = z.looseObject({
  cid: z.string(),
  isUploaded: z.boolean(),
  uploadedAt: z.string().optional(),
  size: z.number(),
});

/** What `POST /ipfs/upload` answers with. */
export const uploadedCidSchema = z.looseObject({ cid: z.string() });
