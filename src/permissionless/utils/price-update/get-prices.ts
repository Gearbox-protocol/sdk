import {
  type Address,
  multicall3Abi,
  type PublicClient,
  type Transport,
} from "viem";
import type { GearboxChain } from "../../../onchain/index.js";
import { OnchainSDK, simulateMulticall } from "../../../onchain/index.js";

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

/**
 * What the feeds report as they stand, in one multicall.
 *
 * What {@link getPrices} does without the part that makes it expensive: no
 * `OnchainSDK` to attach and no update transactions to assemble, which is the
 * whole cost of that call and is wasted on a feed that answers already. A feed
 * that needs a fresh answer before it will be read comes back `null` here, so
 * a caller that must price those falls back to {@link getPrices} for them and
 * pays once for the few rather than once for all.
 *
 * `null` is also a feed whose read reverted for any other reason, which is not
 * a zero.
 */
export async function getLatestPrices({
  client,
  priceFeeds,
}: {
  client: PublicClient;
  priceFeeds: Address[];
}): Promise<Record<Address, bigint | null>> {
  if (priceFeeds.length === 0) {
    return {};
  }

  const results = await client.multicall({
    contracts: priceFeeds.map(getLatestRoundDataCall),
    allowFailure: true,
  });

  return Object.fromEntries(
    priceFeeds.map((priceFeed, index): [Address, bigint | null] => {
      const result = results[index];
      return [
        priceFeed,
        result?.status === "success" ? result.result[1] : null,
      ];
    }),
  ) as Record<Address, bigint | null>;
}

async function getPricesChunk({
  client,
  priceFeeds,
  sdk,
}: {
  client: PublicClient;
  priceFeeds: Address[];
  sdk: OnchainSDK;
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
  gasLimit,
}: {
  client: PublicClient;
  priceFeeds: Address[];
  chunkSize?: number;
  gasLimit?: bigint;
}): Promise<Record<Address, bigint | null>> {
  if (!client.chain) {
    throw new Error("Chain not defined");
  }

  const gearboxClient = client as PublicClient<Transport, GearboxChain>;
  const chain = gearboxClient.chain;
  if (!chain) {
    throw new Error("Chain not defined on client");
  }
  const sdk = new OnchainSDK(
    chain.network,
    { client: gearboxClient },
    { gasLimit },
  );
  await sdk.attach({
    marketConfigurators: [],
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
