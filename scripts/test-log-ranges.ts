import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import {
  type Abi,
  type Address,
  BaseError,
  type ContractEventName,
  createPublicClient,
  erc20Abi,
  http,
  parseAbi,
} from "viem";
import {
  getRpcProviderUrl,
  type RpcProvider,
  SUPPORTED_RPC_PROVIDERS,
} from "../src/dev/index.js";
import {
  type GearboxChain,
  getChain,
  type NetworkType,
  SUPPORTED_NETWORKS,
} from "../src/sdk/index.js";

const ErrorsByProvider = new Map<RpcProvider, Set<string>>();

const BLOCK_RANGES = [
  0n,
  10_000_000n,
  5_000_000n,
  1_000_000n,
  500_000n,
  300_000n,
  200_000n,
  100_000n,
  50_000n,
  10_000n,
  5_000n,
  1_000n,
];

interface Scenario<abi extends Abi | readonly unknown[] = Abi> {
  id: string;
  name: string;
  abi: abi;
  eventName: ContractEventName<abi>;
  address: Address | ((chain: GearboxChain) => Address);
}

function addError(provider: RpcProvider, error: BaseError): void {
  const errors = ErrorsByProvider.get(provider) ?? new Set<string>();
  errors.add(error.name);
  ErrorsByProvider.set(provider, errors);
}

async function testProviderNetworkRange(
  network: NetworkType,
  provider: RpcProvider,
  blockRange: bigint,
  scenario: Scenario,
): Promise<boolean> {
  const chain = getChain(network);
  const address =
    typeof scenario.address === "function"
      ? scenario.address(chain)
      : scenario.address;
  const rpcUrl = getRpcProviderUrl(
    provider,
    network,
    process.env[`${provider}_KEY`.toUpperCase()] ?? "",
  );
  if (!rpcUrl) {
    return false;
  }

  try {
    const client = createPublicClient({
      transport: http(rpcUrl, { timeout: 120_000 }),
    });

    // Get latest block number
    const { number: finalizedBlock } = await client.getBlock({
      blockTag: "finalized",
    });

    // Get logs for Transfer event from block 0 to latest block
    await client.getContractEvents({
      address,
      abi: scenario.abi,
      eventName: scenario.eventName,
      fromBlock: blockRange === 0n ? 0n : finalizedBlock - blockRange,
      toBlock: finalizedBlock,
    });

    await writeFile(
      `tmp/${scenario.id}/${provider}-${network}-${blockRange}-ok.txt`.toLowerCase(),
      "OK",
      "utf-8",
    );
    return true;
  } catch (error) {
    let code = "";
    if (error instanceof BaseError) {
      code = `${error.name}\n\n`;
      addError(provider, error);
    }
    await writeFile(
      `tmp/${scenario.id}/${provider}-${network}-${blockRange}-error.txt`.toLowerCase(),
      `${code}${error}`,
      "utf-8",
    );
    return false;
  }
}

async function testProviderNetwork(
  network: NetworkType,
  provider: RpcProvider,
  scenario: Scenario,
): Promise<bigint | undefined> {
  for (const blockRange of BLOCK_RANGES) {
    const success = await testProviderNetworkRange(
      network,
      provider,
      blockRange,
      scenario,
    );
    if (success) {
      return blockRange;
    }
    await setTimeout(1000);
  }
  return undefined;
}

async function testNetwork(
  network: NetworkType,
  scenario: Scenario,
): Promise<Record<RpcProvider, bigint | undefined>> {
  console.log(`\n=== Testing ${network}`);
  const results = await Promise.all(
    SUPPORTED_RPC_PROVIDERS.map(provider =>
      testProviderNetwork(network, provider, scenario),
    ),
  );
  return results.reduce(
    (acc, result, index) => {
      acc[SUPPORTED_RPC_PROVIDERS[index]] = result;
      return acc;
    },
    {} as Record<RpcProvider, bigint | undefined>,
  );
}

function formatBlockRange(range: bigint | undefined): string {
  if (range === undefined) {
    return "✗";
  }
  if (range === 0n) {
    return "∞";
  }
  if (range >= 1_000_000n) {
    return `${range / 1_000_000n}M`;
  }
  if (range >= 1_000n) {
    return `${range / 1_000n}K`;
  }
  return range.toString();
}

function printResultsTable(
  results: Map<NetworkType, Record<RpcProvider, bigint | undefined>>,
): void {
  const networks = Array.from(results.keys());
  const providers = SUPPORTED_RPC_PROVIDERS;

  // Calculate column widths
  const networkColWidth = Math.max(
    "Network".length,
    ...networks.map(n => n.length),
  );
  const providerColWidths = providers.map(provider =>
    Math.max(
      provider.length,
      ...networks.map(network => {
        const value = results.get(network)?.[provider];
        return formatBlockRange(value).length;
      }),
    ),
  );

  // Print header
  const headerRow =
    "│ " +
    "Network".padEnd(networkColWidth) +
    " │ " +
    providers
      .map((provider, i) => provider.padEnd(providerColWidths[i]))
      .join(" │ ") +
    " │";
  const separatorRow =
    "├" +
    "─".repeat(networkColWidth + 2) +
    "┼" +
    providerColWidths.map(w => "─".repeat(w + 2)).join("┼") +
    "┤";
  const topBorder =
    "┌" +
    "─".repeat(networkColWidth + 2) +
    "┬" +
    providerColWidths.map(w => "─".repeat(w + 2)).join("┬") +
    "┐";
  const bottomBorder =
    "└" +
    "─".repeat(networkColWidth + 2) +
    "┴" +
    providerColWidths.map(w => "─".repeat(w + 2)).join("┴") +
    "┘";

  console.log("\n" + topBorder);
  console.log(headerRow);
  console.log(separatorRow);

  // Print data rows
  for (const network of networks) {
    const networkResults = results.get(network);
    if (!networkResults) continue;
    const row =
      "│ " +
      network.padEnd(networkColWidth) +
      " │ " +
      providers
        .map((provider, i) => {
          const value = networkResults[provider];
          return formatBlockRange(value).padEnd(providerColWidths[i]);
        })
        .join(" │ ") +
      " │";
    console.log(row);
  }

  console.log(bottomBorder);
}

async function testScenario(scenario: Scenario): Promise<void> {
  console.log(`\nStarting scenario ${scenario.name}...\n`);
  await mkdir(path.join("tmp", scenario.id), { recursive: true });

  const results = new Map<
    NetworkType,
    Record<RpcProvider, bigint | undefined>
  >();

  for (const network of SUPPORTED_NETWORKS) {
    results.set(network, await testNetwork(network, scenario));
  }
  console.log(`\n=== Results for ${scenario.name}`);
  printResultsTable(results);
  console.log(`\n`);
}

function printErrorsTable(): void {
  console.info(`\n\n=== Errors by provider ===`);
  for (const p of SUPPORTED_RPC_PROVIDERS) {
    const errors = ErrorsByProvider.get(p) ?? new Set<string>();
    console.log(`${p}: ${Array.from(errors).join(", ")}`);
  }
}

async function main(): Promise<void> {
  const scenarios: Scenario[] = [
    {
      id: "rare",
      name: "Rare event",
      address: "0x77777777144339Bdc3aCceE992D8d4D31734CB2e",
      abi: parseAbi([
        "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
      ]),
      eventName: "OwnershipTransferred",
    },
    {
      id: "impossible",
      name: "Impossible event",
      address: "0x77777777144339Bdc3aCceE992D8d4D31734CB2e",
      abi: parseAbi(["event SomeEvent()"]),
      eventName: "SomeEvent",
    },
    {
      id: "frequent",
      name: "Frequent event",
      address: chain => chain.wellKnownToken.address,
      abi: erc20Abi,
      eventName: "Transfer",
    },
  ];
  for (const scenario of scenarios) {
    await testScenario(scenario);
  }
  printErrorsTable();
  console.log("\n✓ All tests completed!");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
