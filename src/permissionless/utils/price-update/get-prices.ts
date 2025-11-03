import { type Address, multicall3Abi, type PublicClient } from "viem";
import { GearboxSDK } from "../../../sdk/index.js";
import { simulateMulticall } from "../../../sdk/utils/viem/index.js";

const latestRoundDataAbi = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

function getLatestRoundDataCall(priceFeed: Address) {
  return {
    address: priceFeed,
    abi: latestRoundDataAbi,
    functionName: "latestRoundData" as const,
    args: [] as const,
  };
}

async function getPricesChunk({
  client,
  priceFeeds,
  sdk,
}: {
  client: PublicClient;
  priceFeeds: Address[];
  sdk: GearboxSDK;
}): Promise<Record<Address, bigint | null>> {
  const updateCall = priceFeeds.map(priceFeed =>
    getLatestRoundDataCall(priceFeed),
  );

  const updateTxs =
    await sdk.priceFeeds.generateExternalPriceFeedsUpdateTxs(priceFeeds);

  const multicallCalls = updateTxs.txs.map(tx => ({
    target: tx.raw.to as `0x${string}`,
    allowFailure: true,
    callData: tx.raw.callData,
  }));

  const multicall3Address = client.chain?.contracts?.multicall3?.address;
  if (!multicall3Address) {
    throw new Error("Multicall3 address not found");
  }

  // First simulate the multicall3 aggregate
  const multicallResult = await simulateMulticall(client, {
    contracts: [
      {
        address: multicall3Address,
        // @ts-expect-error
        abi: multicall3Abi,
        // @ts-expect-error
        functionName: "aggregate3",
        args: [multicallCalls] as unknown as readonly [],
      },
      ...updateCall,
    ],
    allowFailure: true,
  });

  const prices = multicallResult.results.slice(1).map(result => {
    if (result.status === "failure") {
      return null;
    }
    return result.result[1];
  });

  const priceEntries = priceFeeds.map(
    (priceFeed, index): [Address, bigint | null] => [
      priceFeed,
      prices[index] ?? null,
    ],
  );

  return Object.fromEntries(priceEntries) as Record<Address, bigint | null>;
}

export async function getPrices({
  client,
  priceFeeds,
  chunkSize = 10,
}: {
  client: PublicClient;
  priceFeeds: Address[];
  chunkSize?: number;
}): Promise<Record<Address, bigint | null>> {
  const sdk = await GearboxSDK.attach({
    rpcURLs: [client.transport.url!],
    marketConfigurators: [],
    redstone: {
      ignoreMissingFeeds: true,
    },
    pyth: {
      ignoreMissingFeeds: true,
    },
  });

  const chunks: Address[][] = [];
  for (let i = 0; i < priceFeeds.length; i += chunkSize) {
    chunks.push(priceFeeds.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map(chunk => getPricesChunk({ client, priceFeeds: chunk, sdk })),
  );

  return results.reduce(
    (acc, result) => ({ ...acc, ...result }),
    {} as Record<Address, bigint>,
  );
}
