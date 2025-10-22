import { NetworkType, ZodAddress } from "@gearbox-protocol/sdk";
import { z } from "zod/v4";

const OptionalAddress = () =>
  ZodAddress()
    .optional()
    .transform(addr => addr?.toLowerCase() ?? "");

const RequiredAddress = () =>
  ZodAddress().transform(addr => addr?.toLowerCase() ?? "");

const SharedSchema = z.object({
  /**
   * Timestamp of the metric in seconds
   **/
  ts: z.number().int().positive(),
  /**
   * Network - uses schema from SDK
   **/
  network: NetworkType,
  /**
   * Version for deduplication in SharedReplacingMergeTree - positive integer
   **/
  ver: z.number().int().positive(),
});

export const BaseSchema = z.object({
  ...SharedSchema.shape,
  /**
   * Block number - positive integer
   **/
  block_num: z.bigint().positive(),

  /**
   * Metric value
   **/
  value: z.bigint().nonnegative(),
});

export type BaseSchema = z.input<typeof BaseSchema>;

/**
 * Zod schema for data that can be inserted into the ClickHouse metrics_raw table
 */
export const MetricsRowSchema = z.object({
  ...SharedSchema.shape,
  /**
   * Block number as string representation of bigint
   **/
  block_num: z.string().min(1),
  /**
   * Metric value as string representation of bigint
   **/
  value: z.string().min(1),
  /**
   * Top-level address (e.g. pool or price feed) (optional, defaults to empty string)
   **/
  addr1: OptionalAddress(),
  /**
   * Second-level address (e.g. credit manager) (optional, defaults to empty string)
   **/
  addr2: OptionalAddress(),
  /**
   * Third-level address (e.g. credit account) (optional, defaults to empty string)
   **/
  addr3: OptionalAddress(),
  /**
   * Fourth-level address (e.g. token on credit account) (optional, defaults to empty string)
   **/
  addr4: OptionalAddress(),
  /**
   * Metric name
   **/
  metric: z.string().min(1),
});

export type MetricsRowInput = z.input<typeof MetricsRowSchema>;

export const PoolMetricSchema = z.object({
  ...BaseSchema.shape,
  metric: z.enum([
    "available_liquidity",
    "available_liquidity_usd",
    "expected_liquidity",
    "expected_liquidity_usd",
    "total_borrowed",
    "total_borrowed_usd",
    "total_supply",
    "total_supply_usd",
    "tvl",
    "tvl_usd",
  ]),
  poolAddr: RequiredAddress(),
});

export type PoolMetric = z.input<typeof PoolMetricSchema>;

export const poolMetricRow = z.codec(PoolMetricSchema, MetricsRowSchema, {
  decode: ({ poolAddr, ...v }) => {
    return {
      ...v,
      block_num: v.block_num.toString(),
      value: v.value.toString(),
      addr1: poolAddr,
    };
  },
  encode: ({ metric, block_num, value, addr1, ...v }) => {
    return {
      ...v,
      metric: metric as PoolMetric["metric"],
      block_num: BigInt(block_num),
      value: BigInt(value),
      poolAddr: addr1!,
    };
  },
});

export const CreditManagerMetricSchema = z.object({
  ...BaseSchema.shape,
  metric: z.enum(["total_ca_value", "total_ca_value_usd"]),
  poolAddr: RequiredAddress(),
  cmAddr: RequiredAddress(),
});

export type CreditManagerMetric = z.input<typeof CreditManagerMetricSchema>;

export const cmMetricRow = z.codec(
  CreditManagerMetricSchema,
  MetricsRowSchema,
  {
    decode: ({ poolAddr, cmAddr, ...v }) => {
      return {
        ...v,
        block_num: v.block_num.toString(),
        value: v.value.toString(),
        addr1: poolAddr,
        addr2: cmAddr,
      };
    },
    encode: ({ metric, block_num, value, addr1, addr2, ...v }) => {
      return {
        ...v,
        metric: metric as CreditManagerMetric["metric"],
        block_num: BigInt(block_num),
        value: BigInt(value),
        poolAddr: addr1!,
        cmAddr: addr2!,
      };
    },
  },
);

export const PriceFeedMetricSchema = z.object({
  ...BaseSchema.shape,
  metric: z.enum(["answer", "updated_at"]),
  priceFeedAddr: RequiredAddress(),
});

export type PriceFeedMetric = z.input<typeof PriceFeedMetricSchema>;

export const priceFeedMetricRow = z.codec(
  PriceFeedMetricSchema,
  MetricsRowSchema,
  {
    decode: ({ priceFeedAddr, ...v }) => {
      return {
        ...v,
        block_num: v.block_num.toString(),
        value: v.value.toString(),
        addr1: priceFeedAddr,
      };
    },
    encode: ({ metric, block_num, value, addr1, ...v }) => {
      return {
        ...v,
        metric: metric as PriceFeedMetric["metric"],
        block_num: BigInt(block_num),
        value: BigInt(value),
        priceFeedAddr: addr1!,
      };
    },
  },
);
