import { pino } from "pino";
import { ierc20Abi } from "../src/abi/iERC20.js";
import { createAnvilClient, createMinter } from "../src/dev/index.js";
import { GearboxSDK } from "../src/sdk/index.js";

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
  const sdk = await GearboxSDK.attach({
    rpcURLs: ["http://127.0.0.1:8545"],
    timeout: 480_000,
    logger,
    // ignoreUpdateablePrices: true,
    ignoreUpdateablePrices: true,
  });
  const anvil = createAnvilClient({
    transport: sdk.provider.transport,
    chain: sdk.provider.chain,
  });
  const token = "0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA";
  const receiver = "0x20f1E44d850b495bAc80dcc831f408F8fcDA3E17";
  const minter = createMinter(
    sdk,
    anvil,
    "0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA",
  );
  const before = await anvil.readContract({
    address: token,
    abi: ierc20Abi,
    functionName: "balanceOf",
    args: [receiver],
  });
  await minter.mint(token, receiver, 100_000_000_000n);
  const after = await anvil.readContract({
    address: token,
    abi: ierc20Abi,
    functionName: "balanceOf",
    args: [receiver],
  });
  logger.info(
    `Minted ${after - before} balance before: ${before}, balance after: ${after}`,
  );
}

example().catch(e => {
  logger.error(e);
  process.exit(1);
});
