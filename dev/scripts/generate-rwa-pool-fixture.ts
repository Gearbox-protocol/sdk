/**
 * Generates the offline parse fixture for RWA-default (zapper) pools.
 *
 * Hydrates a serialized `sdk.state` snapshot from the Securitize anvil fork
 * (the same source the RWA e2e tests use). Because `sdk.state.markets` now
 * carries `zappers`, a single snapshot is enough: the zappers self-register on
 * hydrate, so `sdk.getContract(zapper)` resolves fully offline.
 *
 * Usage:
 *   tsx dev/scripts/generate-rwa-pool-fixture.ts
 *
 * The Securitize anvil RPC is public, so no RPC_URL/.env is required. Note the
 * printed block / pool / underlying / zapper values and hardcode them as
 * constants in parseZapperOperationCalldata.test.ts, then commit the fixture.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Address } from "viem";
import { json_stringify, OnchainSDK } from "../../src/sdk/index.js";

const RPC_URL = "https://anvil.gearbox.foundation/rpc/Securitize";

async function main(): Promise<void> {
  const sdk = new OnchainSDK("Mainnet", {
    rpcURLs: [RPC_URL],
    timeout: 120_000,
  });
  await sdk.attach({
    marketConfigurators: ["0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad"],
    rwaFactories: ["0xc6f7b95f6fb8394541d9ac8b0abc94bf6e84f703"],
    ignoreUpdateablePrices: true,
    loadZappers: true,
  });
  await sdk.tokensMeta.loadTokenData();

  const block = sdk.currentBlock;
  const dir = resolve(import.meta.dirname, "../../src/preview/__fixtures__");
  const fixturePath = resolve(dir, `Mainnet-${block}-securitize.json`);
  writeFileSync(fixturePath, json_stringify(sdk.state));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
