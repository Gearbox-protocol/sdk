import { pino } from "pino";
import { getAlchemyUrl } from "../../src/dev/providers.js";
import { AdaptersPlugin } from "../../src/plugins/adapters/AdaptersPlugin.js";
import { MultichainSDK, type NetworkType } from "../../src/sdk/index.js";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    bindings: () => ({}),
    level: label => ({ level: label }),
  },
});

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} env variable is not set`);
  }
  return value;
}

async function listAdapters(): Promise<void> {
  const networks: Partial<Record<NetworkType, string>> = {
    Mainnet: requireEnv("RPC_URL"),
    Monad: requireEnv("MONAD_PROVIDER"),
    Somnia: requireEnv("SOMNIA_PROVIDER"),
    Etherlink: requireEnv("ETHERLINK_PROVIDER"),
    Plasma: getAlchemyUrl("Plasma", requireEnv("ALCHEMY_KEY"))!,
  };

  const sdk = new MultichainSDK({
    chains: Object.fromEntries(
      Object.entries(networks).map(([network, url]) => [
        network,
        { rpcURLs: [url], timeout: 480_000 },
      ]),
    ),
    plugins: {
      adapters: () => new AdaptersPlugin(true),
    },
    logger,
  });
  await sdk.attach({
    perChain: Object.fromEntries(
      Object.keys(networks).map(network => [
        network,
        { ignoreUpdateablePrices: true },
      ]),
    ),
  });

  // contractType -> version -> networks
  const usage = new Map<string, Map<number, Set<NetworkType>>>();

  for (const [network, chainSdk] of sdk.chains) {
    for (const market of chainSdk.marketRegister.markets) {
      for (const suite of market.creditManagers) {
        for (const adapter of suite.creditManager.adapters.values()) {
          let versions = usage.get(adapter.contractType);
          if (!versions) {
            versions = new Map();
            usage.set(adapter.contractType, versions);
          }
          let nets = versions.get(adapter.version);
          if (!nets) {
            nets = new Set();
            versions.set(adapter.version, nets);
          }
          nets.add(network);
        }
      }
    }
  }

  const lines: string[] = [];
  for (const contractType of [...usage.keys()].sort()) {
    const versions = usage.get(contractType)!;
    for (const version of [...versions.keys()].sort((a, b) => a - b)) {
      const nets = [...versions.get(version)!].sort().join(", ");
      lines.push(`${contractType}@${version} (${nets})`);
    }
  }

  console.log("\n=== Adapters used in practice ===");
  for (const line of lines) {
    console.log(line);
  }
  console.log(`Total: ${lines.length} contractType@version pairs`);
}

listAdapters().catch(e => {
  logger.error(e);
  process.exit(1);
});
