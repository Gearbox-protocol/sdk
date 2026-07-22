/**
 * Generates the offline preview fixtures for previewAdjustCreditAccount tests.
 *
 * Attaches to the Gearbox anvil Mainnet fork scoped to the KPK market
 * configurator (which owns the WETH strategy credit manager targeted by the
 * sample multicall transactions) and dumps two fixtures at the same pinned
 * block:
 *   - a minimal `sdk.state` snapshot, replayed via `hydrate` in the test;
 *   - the `CreditAccountData` pre-state of the sample credit account, passed
 *     to previews via `options.creditAccount` so tests stay fully offline.
 *
 * Usage:
 *   tsx scripts/generate-preview-adjust-ca-fixture.ts
 *
 * The anvil RPC is public, so no RPC_URL/.env is required. Note the printed
 * block number and hardcode it as a constant in
 * previewAdjustCreditAccount.test.ts, then commit both fixtures.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Address } from "viem";
import { AdaptersPlugin } from "../src/plugins/adapters/AdaptersPlugin.js";
import { json_stringify, OnchainSDK } from "../src/sdk/index.js";

const RPC_URL = "https://anvil.gearbox.foundation/rpc/Mainnet";

// KPK market configurator on Mainnet, owns the WETH strategy credit manager
// (facade 0x9515AB9BB73A9642F1a93Ba7C2790e9d08227f9a) targeted by the sample
// multicall transactions.
const KPK_MC: Address = "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe";

// Credit account opened on the anvil fork, targeted by all sample multicalls.
const CREDIT_ACCOUNT: Address = "0xE22cEd1808c22455747F366Cf94d45B3201302d3";

async function main(): Promise<void> {
  const sdk = new OnchainSDK(
    "Mainnet",
    { rpcURLs: [RPC_URL], timeout: 480_000 },
    { plugins: { adapters: new AdaptersPlugin(true) }, logger: console },
  );
  await sdk.attach({
    marketConfigurators: [KPK_MC],
    ignoreUpdateablePrices: true,
  });
  await sdk.tokensMeta.loadTokenData();
  const block = sdk.currentBlock;

  const ca = await sdk.accounts.getCreditAccountData(CREDIT_ACCOUNT, block);
  if (!ca) {
    throw new Error(`credit account ${CREDIT_ACCOUNT} not found`);
  }

  const dir = resolve(import.meta.dirname, "../src/preview/__fixtures__");
  const statePath = resolve(dir, `Mainnet-${block}-adjust-credit-account.json`);
  writeFileSync(statePath, json_stringify(sdk.state));
  const caPath = resolve(
    dir,
    `Mainnet-${block}-adjust-credit-account-data.json`,
  );
  writeFileSync(caPath, json_stringify(ca));

  console.log(`Wrote ${statePath}`);
  console.log(`Wrote ${caPath}`);
  console.log(`Block: ${block}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
