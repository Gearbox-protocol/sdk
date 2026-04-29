/**
 * Usage examples demonstrating the new GearboxSDK v2 mock:
 * lazy entity creation, entity navigation, deep exploration, and mode-dependent typing.
 */

import type { Address, RawTx, TvlChartData } from "./core/index.js";
import type { MarketType, PoolOpportunity } from "./entities/index.js";
import type { GearboxSDK } from "./gearbox-sdk.js";
import { createGearboxSDK } from "./gearbox-sdk.js";
import type {
  CuratorsNamespace,
  OpportunitiesNamespace,
} from "./namespaces/index.js";

// ============================================================================
// Compile-time type assertions
// ============================================================================

type OnchainMarket = MarketType<"onchain">;
//   ^? MarketBase & OnchainMarketOps

type _OM_liq = OnchainMarket["availableLiquidity"]; // bigint
type _OM_kyc = OnchainMarket["kycRequired"]; // boolean
// type _OM_apy = OnchainMarket["supplyApy"];  // ← uncomment → TS2339

type OffchainMarket = MarketType<"offchain">;
//   ^? MarketBase & OffchainMarketOps

type _FM_apy = OffchainMarket["supplyApy"]; // number
type _FM_desc = OffchainMarket["description"]; // string
// type _FM_kyc = OffchainMarket["kycRequired"]; // ← uncomment → TS2339

type FullMarket = MarketType<"onchain" | "offchain">;
//   ^? MarketBase & OnchainMarketOps & OffchainMarketOps

type _BM_kyc = FullMarket["kycRequired"]; // boolean
type _BM_apy = FullMarket["supplyApy"]; // number

type OffchainSDK = GearboxSDK<"offchain">;
type _offHasOpps = OffchainSDK["opportunities"]; // OpportunitiesNamespace
type _offHasCurators = OffchainSDK["curators"]; // CuratorsNamespace

type FullSDK = GearboxSDK<"onchain" | "offchain">;
type _hasOpps = FullSDK["opportunities"]; // OpportunitiesNamespace
type _hasCurators = FullSDK["curators"]; // CuratorsNamespace

// ============================================================================
// Example 1: Onchain-only — transaction creation, no offchain data
// ============================================================================

async function onchainOnlyExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  const markets = sdk.markets.findMany({ networks: ["Mainnet"] });
  const market = markets[0];

  console.log("underlying:", market.underlying);
  console.log("liquidity:", market.availableLiquidity);
  console.log("kyc required:", market.kycRequired);

  const tx: RawTx = market.createDepositTx(1000n * 10n ** 6n);
  console.log("deposit tx:", tx);

  // Offchain ops are NOT available on MarketType<'onchain'>:
  //   market.supplyApy              // ← TS2339
  //   market.description            // ← TS2339
  //   market.loadHistoricalTvl(0, 100) // ← TS2339
  //
  // Opportunities and Curators namespaces are NOT available (no offchain):
  //   sdk.opportunities             // ← TS2339
  //   sdk.curators                  // ← TS2339
}

// ============================================================================
// Example 2: Offchain-only — APYs, descriptions, curators
// ============================================================================

async function offchainOnlyExample() {
  const sdk = createGearboxSDK({
    modes: ["offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  const markets = sdk.markets.findMany({ networks: ["Mainnet"] });
  const market = markets[0];

  console.log("underlying:", market.underlying);
  console.log("apy:", market.supplyApy);
  console.log("description:", market.description);

  const tvl: TvlChartData = await market.loadHistoricalTvl(1000, 2000);
  console.log("tvl chart:", tvl);

  // Curators namespace IS available (offchain)
  const curators: CuratorsNamespace = sdk.curators;
  const allCurators = curators.findMany();
  console.log(
    "curators:",
    allCurators.map(c => c.name),
  );

  // Opportunities namespace IS available (offchain) — most data is offchain
  const opps: OpportunitiesNamespace = sdk.opportunities;
  const poolOpps = opps
    .findMany({ types: ["pool"], minApy: 3.0 })
    .filter((o): o is PoolOpportunity => o.type === "pool");
  for (const opp of poolOpps) {
    console.log(`  [${opp.type}] ${opp.title}, APY: ${opp.supplyApy}%`);
  }

  // Onchain ops are NOT available on MarketType<'offchain'>:
  //   market.kycRequired              // ← TS2339
  //   market.createDepositTx(1000n)   // ← TS2339
  //   poolOpps[0].createDepositTx(1n) // ← TS2339
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

  const market = sdk.markets.findMany({ networks: ["Mainnet"] })[0];

  // All ops available
  console.log("kyc:", market.kycRequired);
  console.log("apy:", market.supplyApy);
  const tx: RawTx = market.createDepositTx(1000n * 10n ** 6n);
  const tvl: TvlChartData = await market.loadHistoricalTvl(1000, 2000);

  // Opportunities namespace available (both modes present)
  const opps: OpportunitiesNamespace = sdk.opportunities;
  const poolOpps = opps.findMany({
    networks: ["Mainnet", "Monad"],
    types: ["pool"],
    minApy: 3.0,
  });

  for (const opp of poolOpps) {
    console.log(`${opp.chainId}: ${opp.title}, KYC=${opp.kycRequired}`);
    if (opp.type === "pool") {
      console.log(`  supply APY: ${opp.supplyApy}%`);
    }
  }

  // Curators namespace available
  const chaos = sdk.curators.findOne("Chaos Labs");
  console.log("Chaos Labs markets:", chaos?.markets.length);
}

// ============================================================================
// Example 4: Entity navigation — traverse the graph
// ============================================================================

async function navigationExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain", "offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  // Market → Curator
  const market = sdk.markets.findOne(
    "Mainnet",
    "0x1111111111111111111111111111111111111111" as Address,
  )!;
  const curator = market.curator!;
  console.log(`Market ${market.poolAddress} curated by: ${curator.name}`);

  // Market → Opportunities
  const marketOpps = market.opportunities;
  console.log(`Market has ${marketOpps.length} opportunities:`);
  for (const opp of marketOpps) {
    console.log(`  - [${opp.type}] ${opp.title}`);
  }

  // Opportunity → Market (round-trip)
  const opp = marketOpps[0];
  const backToMarket = opp.market;
  console.log(`Opportunity's market pool: ${backToMarket.poolAddress}`);
  console.log(
    `Same market? ${backToMarket.poolAddress === market.poolAddress}`,
  );

  // Opportunity → Curator
  const oppCurator = opp.curator!;
  console.log(`Opportunity curated by: ${oppCurator.name}`);

  // Curator → Markets (all markets across chains)
  const curatorMarkets = curator.markets;
  console.log(`${curator.name} manages ${curatorMarkets.length} markets:`);
  for (const m of curatorMarkets) {
    console.log(`  - ${m.network}: ${m.poolAddress} (APY: ${m.supplyApy}%)`);
  }

  // Curator → Opportunities (join: curator → markets → pools → opportunities)
  const curatorOpps = curator.opportunities;
  console.log(
    `${curator.name} has ${curatorOpps.length} opportunities across all markets:`,
  );
  for (const o of curatorOpps) {
    console.log(`  - [${o.type}] ${o.title}`);
  }
}

// ============================================================================
// Example 5: Deep exploration — chained queries
// ============================================================================

async function deepExplorationExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain", "offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;

  // Find all pool opportunities for USDC markets with APY > 5%
  const highYieldUsdc = sdk.markets
    .findMany({ underlying: usdc })
    .flatMap(m => m.opportunities)
    .filter(o => o.type === "pool")
    .filter(o => o.supplyApy > 5);

  console.log(
    `Found ${highYieldUsdc.length} high-yield USDC pool opportunities:`,
  );
  for (const opp of highYieldUsdc) {
    console.log(
      `  ${opp.title}: ${opp.supplyApy}% APY, TVL $${opp.tvlUsd.toLocaleString()}`,
    );
  }

  // Find all curators and their best pool opportunity
  const curatorsWithBest = sdk.curators.findMany().map(curator => {
    const poolOpps = curator.opportunities.filter(
      (o): o is PoolOpportunity => o.type === "pool",
    );
    const best = poolOpps.sort((a, b) => b.supplyApy - a.supplyApy)[0];
    return { curator: curator.name, best };
  });

  console.log("\nBest opportunity per curator:");
  for (const { curator, best } of curatorsWithBest) {
    if (best) {
      console.log(`  ${curator}: ${best.title} — ${best.supplyApy}% APY`);
    } else {
      console.log(`  ${curator}: no pool opportunities`);
    }
  }

  // Navigate: best opportunity → its market → check TVL → create deposit tx
  const bestOverall = curatorsWithBest
    .filter(c => c.best)
    .sort((a, b) => b.best!.supplyApy - a.best!.supplyApy)[0];

  if (bestOverall?.best) {
    const best = bestOverall.best;
    const market = best.market;
    console.log(`\nBest overall: ${best.title} (${bestOverall.curator})`);
    console.log(`  Pool: ${market.poolAddress} on ${market.network}`);
    console.log(
      `  KYC: ${market.kycRequired}, Liquidity: ${market.availableLiquidity}`,
    );

    const now = Math.floor(Date.now() / 1000);
    const tvl = await market.loadHistoricalTvl(now - 30 * 86400, now);
    const trend = tvl.length >= 2 ? tvl[tvl.length - 1].tvl - tvl[0].tvl : 0;
    console.log(`  TVL trend (30d): ${trend > 0 ? "+" : ""}${trend}`);

    const rawTx: RawTx = best.createDepositTx(10_000n * 10n ** 6n);
    console.log("  Deposit tx:", rawTx);
  }
}

// ============================================================================
// Example 6: AI agent — systematic strategy selection
// ============================================================================

async function aiAgentExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain", "offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;

  // 1. Find all USDC opportunities across all networks, non-KYC
  const viable = sdk.opportunities
    .findMany({ underlying: usdc, kycRequired: false, types: ["pool"] })
    .filter((o): o is PoolOpportunity => o.type === "pool")
    .sort((a, b) => b.supplyApy - a.supplyApy);

  if (!viable.length) {
    console.log("No viable opportunities");
    return;
  }

  console.log(`Found ${viable.length} non-KYC USDC pool opportunities:`);
  for (const opp of viable) {
    console.log(
      `  ${opp.title}: ${opp.supplyApy}% APY (curator: ${opp.curatorName})`,
    );
  }

  const best = viable[0];
  console.log(`\nBest: ${best.title} — ${best.supplyApy}% APY`);

  // 2. Check the curator's reputation
  const curator = best.curator!;
  console.log(`Curator: ${curator.name}`);
  console.log(`  Link: ${curator.link}`);
  console.log(`  Markets managed: ${curator.markets.length}`);
  console.log(`  Total opportunities: ${curator.opportunities.length}`);

  // 3. Check historical TVL trend for the pool
  const market = best.market;
  const now = Math.floor(Date.now() / 1000);
  const tvl = await market.loadHistoricalTvl(now - 30 * 86400, now);
  const trend = tvl.length >= 2 ? tvl[tvl.length - 1].tvl - tvl[0].tvl : 0;
  console.log(`TVL trend (30d): ${trend > 0 ? "+" : ""}${trend}`);

  // 4. Create deposit tx
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

  console.log("\n=== Navigation ===");
  await navigationExample();

  console.log("\n=== Deep Exploration ===");
  await deepExplorationExample();

  console.log("\n=== AI Agent ===");
  await aiAgentExample();
}

main().catch(console.error);
