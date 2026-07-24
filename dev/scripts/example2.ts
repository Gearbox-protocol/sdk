import { pino } from "pino";
import { AdaptersPlugin } from "../../src/plugins/adapters/index.js";
import { json_stringify, OnchainSDK } from "../../src/sdk/index.js";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "debug",
  formatters: {
    bindings: () => ({}),
    level: label => {
      return {
        level: label,
      };
    },
  },
});

async function example(): Promise<void> {
  const sdk = new OnchainSDK(
    "Mainnet",
    {
      rpcURLs: ["https://anvil.gearbox.foundation/rpc/RWA"],
    },
    { plugins: { adapters: new AdaptersPlugin() } },
  );
  await sdk.attach({
    loadZappers: true,
    marketConfigurators: [
      "0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad",
      "0xa770ce584adb6491a2138da6eaec33243bdcd248",
    ],
    rwaFactories: ["0xc6f7b95f6fb8394541d9ac8b0abc94bf6e84f703"],
  });

  const data = await sdk.accounts.getCreditAccountData(
    "0x4e0b7f7fd517a805564b8bc5380a6ff4076bcca3",
  );
  console.info(json_stringify(data));
}

example().catch(e => {
  logger.error(e);
  process.exit(1);
});
