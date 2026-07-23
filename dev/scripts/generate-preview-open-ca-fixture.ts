/**
 * Generates the offline preview fixture for previewOpenCreditAccount tests.
 *
 * Attaches to Mainnet twice: first with all default market configurators to
 * discover which ones own the credit managers targeted by the sample
 * openCreditAccount transactions, then re-attaches scoped to just those
 * configurators and dumps a minimal `sdk.state` snapshot.
 *
 * Usage:
 *   tsx dev/scripts/generate-preview-open-ca-fixture.ts
 *
 * Environment:
 *   RPC_URL - Mainnet RPC URL (required)
 *
 * Note the printed block number and hardcode it as a constant in
 * previewOpenCreditAccount.test.ts, then commit the fixture.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Address } from "viem";
import { AdaptersPlugin } from "../../src/plugins/adapters/AdaptersPlugin.js";
import { json_stringify, OnchainSDK } from "../../src/sdk/index.js";

const RPC_URL = process.env.RPC_URL ?? "";
if (!RPC_URL) {
  console.error("RPC_URL environment variable is required");
  process.exit(1);
}

// Credit facades targeted by the sample transactions in
// previewOpenCreditAccount.test.ts.
const FACADES: Address[] = [
  // USDC credit manager facade (plain account)
  "0x67bf2a7778edb535A167fF6C959E08d537888118",
  // wstETH credit manager facade (lending)
  "0xb637548C1f4d50dD61822eec7BC1ec23cfc45F53",
  // WETH credit manager facade (strategies)
  "0x9515AB9BB73A9642F1a93Ba7C2790e9d08227f9a",
];

function makeSdk(): OnchainSDK<{
  adapters: AdaptersPlugin;
}> {
  return new OnchainSDK(
    "Mainnet",
    { rpcURLs: [RPC_URL], timeout: 480_000 },
    { plugins: { adapters: new AdaptersPlugin(true) }, logger: console },
  );
}

async function main(): Promise<void> {
  console.log("[1/2] Attaching with all default market configurators...");
  const sdk = makeSdk();
  await sdk.attach({ ignoreUpdateablePrices: true });
  const block = sdk.currentBlock;

  const mcs = new Set<Address>();
  for (const facade of FACADES) {
    const addr = facade.toLowerCase();
    const market = sdk.marketRegister.markets.find(m =>
      m.creditManagers.some(
        cm => cm.creditFacade.address.toLowerCase() === addr,
      ),
    );
    if (!market) {
      throw new Error(`No market found for facade ${facade}`);
    }
    mcs.add(market.configurator.address);
    console.log(`  facade ${facade} -> MC ${market.configurator.address}`);
  }

  console.log(
    `[2/2] Re-attaching at block ${block} scoped to ${mcs.size} MC(s)...`,
  );
  const scopedSdk = makeSdk();
  await scopedSdk.attach({
    blockNumber: block,
    marketConfigurators: [...mcs],
    ignoreUpdateablePrices: true,
  });
  await scopedSdk.tokensMeta.loadTokenData();

  const dir = resolve(import.meta.dirname, "../../src/preview/__fixtures__");
  const fixturePath = resolve(dir, `Mainnet-${block}-open-credit-account.json`);
  writeFileSync(fixturePath, json_stringify(scopedSdk.state));
  console.log(`Wrote ${fixturePath}`);
  console.log(`Block: ${block}`);
  console.log(`Market configurators: ${[...mcs].join(", ")}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
