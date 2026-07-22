import { pino } from "pino";
import { json_stringify, OnchainSDK } from "../src/sdk/index.js";

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
  const sdk = new OnchainSDK("Mainnet", {
    rpcURLs: ["https://anvil.gearbox.foundation/rpc/Securitize"],
  });
  await sdk.attach({
    loadZappers: true,
    marketConfigurators: ["0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad"],
    rwaFactories: ["0xc6f7b95f6fb8394541d9ac8b0abc94bf6e84f703"],
  });
  const creditAccountData = await sdk.accounts.getCreditAccountData(
    "0x82900e2ab20b6f60c159f1a141a6f2d3d810c4fa",
  );
  console.info(json_stringify(creditAccountData));

  logger.info("done");
}

example().catch(e => {
  logger.error(e);
  process.exit(1);
});
