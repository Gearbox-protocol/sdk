import { pino } from "pino";
import { createPublicClient, http, parseAbi, stringToHex } from "viem";

import { iAddressProviderV310Abi } from "../src/abi/v310.js";
import { BotsPlugin } from "../src/bots/BotsPlugin.js";
import { GearboxSDK, json_stringify } from "../src/sdk/index.js";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });

  const ADDRESS_PROVIDER = "0xbab2014dd88223e168ba06911c06df638311a097";
  const RPC = "https://anvil.gearbox.foundation/rpc/Eth211";

  const client = createPublicClient({
    transport: http(RPC),
  });
  const mcf = await client.readContract({
    abi: iAddressProviderV310Abi,
    address: ADDRESS_PROVIDER,
    functionName: "getAddressOrRevert",
    args: [stringToHex("MARKET_CONFIGURATOR_FACTORY", { size: 32 }), 0n],
  });
  const confgurators = await client.readContract({
    address: mcf,
    abi: parseAbi([
      "function getMarketConfigurators() external view returns (address[] memory)",
    ]),
    functionName: "getMarketConfigurators",
  });
  logger.debug({ confgurators }, "loaded market configurators");

  const sdk = await GearboxSDK.attach({
    rpcURLs: [RPC],
    timeout: 480_000,
    // addressProvider: ADDRESS_PROVIDER,
    // marketConfigurators: [...confgurators],
    logger,
    ignoreUpdateablePrices: false,
    strictContractTypes: true,
    plugins: {
      // adapters: AdaptersPlugin,
      // zappers: ZappersPlugin,
      bots: BotsPlugin,
    },
  });

  console.log(json_stringify(sdk.plugins.bots.stateHuman()));

  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
