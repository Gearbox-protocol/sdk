import {
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
  type Transport,
  toFunctionSelector,
} from "viem";
import {
  AP_PRICE_FEED_COMPRESSOR,
  type OnchainSDK,
  type RawTx,
  VERSION_RANGE_310,
} from "../../../../onchain/index.js";
import {
  convertRawTxToSafeMultisigTx,
  GovernorContract,
  getUpdatablePriceFeeds,
  type TimelockTxs,
} from "../../../index.js";
import type { BatchTxs } from "../market-tx.js";

export interface SignedTimelockTxs extends TimelockTxs {
  signature: Hex;
}

export interface SignedTimelockTxsWithHashes extends SignedTimelockTxs {
  timelockTxsHashes: Hex[];
}

export interface TimelockTxsIpfs {
  eta: number;
  txHashes: Hex[];
  ipfsCid: string;
}

async function getGovernorContract(args: {
  marketConfigurator: Address;
  client: PublicClient<Transport, Chain>;
}) {
  const { marketConfigurator, client } = args;

  const timelockAddress = await client.readContract({
    address: marketConfigurator,
    abi: [
      {
        type: "function",
        inputs: [],
        name: "admin",
        outputs: [{ type: "address" }],
        stateMutability: "view",
      },
    ],
    functionName: "admin",
  });

  const governorAddress = await client.readContract({
    address: timelockAddress,
    abi: [
      {
        type: "function",
        inputs: [],
        name: "admin",
        outputs: [{ type: "address" }],
        stateMutability: "view",
      },
    ],
    functionName: "admin",
  });

  return new GovernorContract(governorAddress, client);
}

export async function getTimelockTransactions(args: {
  client: PublicClient<Transport, Chain>;
  eta: number;
  author: Address;
  marketConfigurator: Address;
  batches: BatchTxs[];
  sdk: OnchainSDK;
}): Promise<TimelockTxs> {
  const { client, eta, marketConfigurator, batches, author, sdk } = args;

  const governorContract = await getGovernorContract({
    client,
    marketConfigurator,
  });

  const queueBatches = governorContract
    .createGovernorBatches({
      batches: batches.map(({ txs }) => txs),
      eta,
    })
    .map(batch => batch.map(convertRawTxToSafeMultisigTx));

  const [chainId, latestBlock] = await Promise.all([
    client.getChainId(),
    client.getBlockNumber(),
  ]);

  const [pfCompressor] = sdk.addressProvider.mustGetLatest(
    AP_PRICE_FEED_COMPRESSOR,
    VERSION_RANGE_310,
  );

  const updatableFeeds = await Promise.all(
    batches
      .map(({ touchedFeeds }) => touchedFeeds)
      .map(async priceFeeds => {
        if (priceFeeds.length === 0) {
          return [];
        }
        const contracts = await getUpdatablePriceFeeds({
          sdk: sdk,
          client,
          pfCompressor,
          priceFeeds,
        });

        return contracts.map(contract => contract.address);
      }),
  );

  return {
    chainId,
    eta,
    marketConfigurator,
    queueBatches,
    author,
    createdAtBlock: Number(latestBlock),
    updatableFeeds,
  };
}

export function getTimelockTransactionsForExecution(
  txs: TimelockTxs,
): Omit<RawTx, "signature" | "contractMethod" | "contractInputsValues">[] {
  const result: Omit<
    RawTx,
    "signature" | "contractMethod" | "contractInputsValues"
  >[] = [];
  for (let i = 0; i < txs.queueBatches.length; i++) {
    const batch = txs.queueBatches[i];
    if (batch.length <= 1) {
      throw new Error(`batch ${i} has 1 or less txs`);
    }
    const startBatch = batch[0];
    // if (startBatch.to !== governor) {
    //   throw new Error(`batch ${i} does not start with governor`);
    // }
    if (startBatch.contractMethod?.name !== "startBatch") {
      throw new Error(`batch ${i} does not start with startBatch`);
    }
    for (let j = 1; j < batch.length; j++) {
      const tx = batch[j];
      if (tx.contractMethod.name !== "queueTransaction") {
        throw new Error(
          `expected queueTransaction tx ${j} in batch ${i}, got ${tx.contractMethod.name}`,
        );
      }
      const { target, data, value } = tx.contractInputsValues;
      const signature = tx.contractInputsValues.signature.startsWith("function")
        ? tx.contractInputsValues.signature
        : `function ${tx.contractInputsValues.signature}`;
      const selector = toFunctionSelector(signature);
      const callData = data.replace("0x", selector);

      result.push({
        to: target as Address,
        callData: callData as Hex,
        value: value as string,
        description: tx.contractInputsValues.signature,
      });
    }
  }
  return result;
}
