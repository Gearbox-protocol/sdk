/**
 * Usage examples demonstrating type-safe mode-dependent behavior.
 */

import type { Address, RawTx, TvlChartData } from "./core/index.js";
import type { Market, Pool } from "./entities/index.js";
import type { GearboxSDK, GearboxSDKConfig } from "./gearbox-sdk.js";
import { createGearboxSDK } from "./gearbox-sdk.js";
import type { OpportunitiesNamespace } from "./namespaces/index.js";

// ============================================================================
// Compile-time type assertions
// Hover over these in the IDE to verify resolution.
// ============================================================================

type OnchainPool = Pool<"onchain">;
//   ^? PoolBase & OnchainPoolOps

type _OP_addr = OnchainPool["address"]; // Address
type _OP_kyc = OnchainPool["kycRequired"]; // boolean
// type _OP_apy = OnchainPool["apy"];        // ← uncomment → TS2339

type OffchainPool = Pool<"offchain">;
//   ^? PoolBase & OffchainPoolOps

type _FP_apy = OffchainPool["apy"]; // number
type _FP_desc = OffchainPool["description"]; // string
// type _FP_kyc = OffchainPool["kycRequired"]; // ← uncomment → TS2339

type FullPool = Pool<"onchain" | "offchain">;
//   ^? PoolBase & OnchainPoolOps & OffchainPoolOps

type _BP_kyc = FullPool["kycRequired"]; // boolean
type _BP_apy = FullPool["apy"]; // number

type OnchainMarketPool = Market<"onchain">["pool"];
//   ^? Pool<"onchain">

type FullSDK = GearboxSDK<"onchain" | "offchain">;
type _hasOpps = FullSDK["opportunities"]; // OpportunitiesNamespace

// ============================================================================
// Example 1: Onchain-only
// ============================================================================

async function onchainOnlyExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  const markets = sdk.markets.find({ networks: ["Mainnet"] });
  const pool = markets[0].pool;

  console.log("underlying:", pool.underlying);
  console.log("liquidity:", pool.availableLiquidity);
  console.log("kyc required:", pool.kycRequired);

  const tx: RawTx = pool.createDepositTx(1000n * 10n ** 6n);
  console.log("deposit tx:", tx);

  // Offchain ops are NOT available on Pool<'onchain'>.
  // Uncomment to see TS2339:
  //   pool.apy
  //   pool.description
  //   pool.loadHistoricalTvl(0, 100)
  //
  // Opportunities namespace is NOT available:
  //   sdk.opportunities
}

// ============================================================================
// Example 2: Offchain-only
// ============================================================================

async function offchainOnlyExample() {
  const sdk = createGearboxSDK({
    modes: ["offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  const pools = sdk.pools.find({ networks: ["Mainnet"] });
  const pool = pools[0];

  console.log("underlying:", pool.underlying);
  console.log("apy:", pool.apy);
  console.log("description:", pool.description);

  const tvl: TvlChartData = await pool.loadHistoricalTvl(1000, 2000);
  console.log("tvl chart:", tvl);

  // Onchain ops are NOT available on Pool<'offchain'>.
  // Uncomment to see TS2339:
  //   pool.kycRequired
  //   pool.createDepositTx(1000n)
}

// ============================================================================
// Example 3: Both modes — full power
// ============================================================================

async function bothModesExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain", "offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  const pool = sdk.markets.find({ networks: ["Mainnet"] })[0].pool;

  // All ops available
  console.log("kyc:", pool.kycRequired);
  console.log("apy:", pool.apy);
  const tx: RawTx = pool.createDepositTx(1000n * 10n ** 6n);
  const tvl: TvlChartData = await pool.loadHistoricalTvl(1000, 2000);

  // Opportunities namespace available (both modes present)
  const opps: OpportunitiesNamespace = sdk.opportunities;
  const opportunities = opps.find({
    networks: ["Mainnet", "Monad"],
    types: ["pool"],
    minApy: 3.0,
  });

  for (const opp of opportunities) {
    console.log(`${opp.network}: ${opp.apy}% APY, KYC=${opp.kycRequired}`);
    if (!opp.kycRequired && opp.apy > 5) {
      const depositTx = opp.createDepositTx(10_000n * 10n ** 6n);
      console.log("  → tx:", depositTx.description);
    }
  }
}

// ============================================================================
// Example 4: AI agent — choose best market and deposit
// ============================================================================

async function aiAgentExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain", "offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  // 1. Find USDC opportunities, non-KYC, sorted by APY
  const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;
  const viable = sdk.opportunities
    .find({ types: ["pool"], underlying: usdc })
    .filter(o => !o.kycRequired)
    .sort((a, b) => b.apy - a.apy);

  if (!viable.length) {
    console.log("No viable opportunities");
    return;
  }

  const best = viable[0];
  console.log(`Best: ${best.network} — ${best.apy}% APY`);

  // 2. Check historical TVL trend
  const pool = sdk.pools.get(best.network, best.poolAddress)!;
  const now = Math.floor(Date.now() / 1000);
  const tvl = await pool.loadHistoricalTvl(now - 30 * 86400, now);
  const trend = tvl.length >= 2 ? tvl[tvl.length - 1].tvl - tvl[0].tvl : 0;
  console.log(`TVL trend (30d): ${trend > 0 ? "+" : ""}${trend}`);

  // 3. Create deposit tx
  const rawTx: RawTx = best.createDepositTx(10_000n * 10n ** 6n);
  console.log("Raw tx:", rawTx);
  return rawTx;
}

// ============================================================================
// Run
// ============================================================================

async function main() {
  console.log("=== Onchain-only ===");
  await onchainOnlyExample();
  console.log("\n=== Offchain-only ===");
  await offchainOnlyExample();
  console.log("\n=== Both modes ===");
  await bothModesExample();
  console.log("\n=== AI Agent ===");
  await aiAgentExample();
}

main().catch(console.error);
