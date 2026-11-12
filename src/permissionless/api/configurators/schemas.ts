import { type Hex, isHex } from "viem";
import { z } from "zod/v4";
import { addressSchema } from "../schemas.js";

/** A `0x`-prefixed hex string, as viem's `Hex`. */
const hexSchema = z.custom<Hex>(
  value => typeof value === "string" && isHex(value),
  { message: "invalid hex string" },
);

/**
 * Runtime schemas for {@link ./types.js}. Loose, like the other namespaces':
 * the backend may add fields before this client learns about them.
 **/

/** {@link PermissionlessLifecycle} */
const lifecycleSchema = z.discriminatedUnion("status", [
  z.looseObject({
    status: z.literal("orphan"),
    createBlock: z.null(),
    shutdownBlock: z.null(),
  }),
  z.looseObject({
    status: z.literal("active"),
    createBlock: z.number(),
    shutdownBlock: z.null(),
  }),
  z.looseObject({
    status: z.literal("shutdown"),
    createBlock: z.number(),
    shutdownBlock: z.number(),
  }),
]);

/** {@link PermissionlessConfigurator} */
export const configuratorSchema = z.intersection(
  lifecycleSchema,
  z.looseObject({
    chainId: z.number(),
    address: addressSchema,
    name: z.string(),
    admin: addressSchema,
    treasury: addressSchema,
    owner: addressSchema,
    governor: z.boolean(),
    public: z.boolean(),
    marketsQty: z.number(),
  }),
);

/** {@link PermissionlessConfiguratorMarket} */
export const configuratorMarketSchema = z.intersection(
  lifecycleSchema,
  z.looseObject({
    chainId: z.number(),
    address: addressSchema,
    marketConfigurator: addressSchema,
    underlyingToken: addressSchema,
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
  }),
);

/** {@link PermissionlessTimelockEvent} */
export const timelockEventSchema = z.looseObject({
  chainId: z.number(),
  marketConfigurator: addressSchema,
  txHash: hexSchema,
  status: z.enum([
    "QueueTransaction",
    "ExecuteTransaction",
    "CancelTransaction",
  ]),
  blockNumber: z.number(),
  logId: z.number(),
  eta: z.number(),
});
