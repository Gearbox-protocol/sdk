import type { AccountsPlugin } from "../src/plugins/accounts/index.js";
import type { GearboxSDK } from "../src/sdk/index.js";
import {
  type BaseSchema,
  type CreditManagerMetric,
  cmMetricRow,
  type MetricsRowInput,
  type PoolMetric,
  type PriceFeedMetric,
  poolMetricRow,
  priceFeedMetricRow,
} from "./schema.js";

/**
 * Harvests following metrics from Gearbox SDK:
 * By pool:
 * - available_liquidity_usd
 * - available_liquidity
 * - total_borrowed_usd
 * - total_borrowed
 * - tvl
 * - tvl_usd
 * By credit manager:
 * - total_ca_value
 * - total_ca_value_usd
 * @param sdk
 */
export default function deriveMetrics(
  sdk: GearboxSDK<{
    readonly accounts: AccountsPlugin;
  }>,
): MetricsRowInput[] {
  const poolMetrics: PoolMetric[] = [];
  const cmMetrics: CreditManagerMetric[] = [];
  const priceFeedMetrics: PriceFeedMetric[] = [];

  const {
    marketRegister: { markets },
    plugins,
  } = sdk;
  const base: Omit<BaseSchema, "metric" | "value"> = {
    ts: Number(sdk.timestamp),
    network: sdk.networkType,
    block_num: sdk.currentBlock,
    ver: 1,
  };
  for (const { pool, priceOracle, creditManagers } of markets) {
    const {
      address: poolAddr,
      availableLiquidity,
      totalBorrowed,
      expectedLiquidity,
      totalSupply,
      underlying,
    } = pool.pool;
    const availableLiquidityUSD = priceOracle.convertToUSD(
      underlying,
      availableLiquidity,
    );
    const expectedLiquidityUSD = priceOracle.convertToUSD(
      underlying,
      expectedLiquidity,
    );
    const totalBorrowedUSD = priceOracle.convertToUSD(
      underlying,
      totalBorrowed,
    );
    const totalSupplyUSD = priceOracle.convertToUSD(underlying, totalSupply);
    let tvl = availableLiquidity + totalBorrowed;
    let tvl_usd = availableLiquidityUSD + totalBorrowedUSD;
    for (const cs of creditManagers) {
      const cmAddr = cs.creditManager.address;
      let [cmTotalValue, cmTotalValueUSD] = [0n, 0n];
      const accounts = plugins.accounts.byCreditManager(cmAddr);
      for (const acc of accounts) {
        cmTotalValue += acc.totalValue;
        cmTotalValueUSD += acc.totalValueUSD;
      }
      cmMetrics.push({
        ...base,
        poolAddr,
        cmAddr,
        metric: "total_ca_value",
        value: cmTotalValue,
      });
      cmMetrics.push({
        ...base,
        poolAddr,
        cmAddr,
        metric: "total_ca_value_usd",
        value: cmTotalValueUSD,
      });
      tvl += cmTotalValue;
      tvl_usd += cmTotalValueUSD;
    }
    poolMetrics.push(
      {
        ...base,
        poolAddr,
        metric: "available_liquidity_usd",
        value: availableLiquidityUSD,
      },
      {
        ...base,
        poolAddr,
        metric: "available_liquidity",
        value: availableLiquidity,
      },
      {
        ...base,
        poolAddr,
        metric: "expected_liquidity",
        value: expectedLiquidity,
      },
      {
        ...base,
        poolAddr,
        metric: "expected_liquidity_usd",
        value: expectedLiquidityUSD,
      },
      {
        ...base,
        poolAddr,
        metric: "total_borrowed_usd",
        value: totalBorrowedUSD,
      },
      {
        ...base,
        poolAddr,
        metric: "total_borrowed",
        value: totalBorrowed,
      },
      {
        ...base,
        poolAddr,
        metric: "total_supply",
        value: totalSupply,
      },
      {
        ...base,
        poolAddr,
        metric: "total_supply_usd",
        value: totalSupplyUSD,
      },
      {
        ...base,
        poolAddr,
        metric: "tvl",
        value: tvl,
      },
      {
        ...base,
        poolAddr,
        metric: "tvl_usd",
        value: tvl_usd,
      },
    );
  }

  for (const f of sdk.priceFeeds.feeds) {
    if (!f.answer.success) {
      continue;
    }
    priceFeedMetrics.push(
      {
        ...base,
        priceFeedAddr: f.address,
        metric: "answer",
        value: f.answer.price,
      },
      {
        ...base,
        priceFeedAddr: f.address,
        metric: "updated_at",
        value: f.answer.updatedAt,
      },
    );
  }

  return [
    ...poolMetrics.map(v => poolMetricRow.decode(v)),
    ...cmMetrics.map(v => cmMetricRow.decode(v)),
    ...priceFeedMetrics.map(v => priceFeedMetricRow.decode(v)),
  ];
}
