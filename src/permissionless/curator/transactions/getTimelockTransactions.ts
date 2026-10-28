import {
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
  type Transport,
  toFunctionSelector,
} from "viem";
import { iMarketConfiguratorV310Abi } from "../../../abi/310/generated.js";
import {
  AP_PRICE_FEED_COMPRESSOR,
  type OnchainSDK,
  VERSION_RANGE_310,
} from "../../../onchain/index.js";
import { GovernorContract } from "../../bindings/governance/governor.js";
import { TimeLockContract } from "../../bindings/governance/timelock.js";
import { convertRawTxToSafeMultisigTx } from "../../utils/governance/batch.js";
import type { TimelockTxs } from "../../utils/governance/types.js";
import { getUpdatablePriceFeeds } from "../../utils/price-update/get-updatable-feeds.js";
import type { ForkExecutionCall } from "../simulation/simulateGipOnFork.js";
import type { BatchTxs } from "../types.js";

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

/**
 * The governor that owns the TimeLock of `marketConfigurator`.
 *
 * `MarketConfigurator.admin()` is the TimeLock and `TimeLock.admin()` is the
 * governor, so queueing and executing both go through this contract.
 **/
export async function getGovernorContract(args: {
  marketConfigurator: Address;
  client: PublicClient<Transport, Chain>;
}) {
  const { marketConfigurator, client } = args;
  const timelock = await client.readContract({
    address: marketConfigurator,
    abi: iMarketConfiguratorV310Abi,
    functionName: "admin",
  });
  const governor = await new TimeLockContract(timelock, client).admin();
  return new GovernorContract(governor, client);
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
    batches.map(async ({ touchedFeeds: priceFeeds }) => {
      if (priceFeeds.length === 0) {
        return [];
      }
      const contracts = await getUpdatablePriceFeeds({
        sdk,
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

/**
 * The payload calls the TimeLock will execute, in order: every
 * `queueTransaction` of every batch, with its selector restored from the
 * signature, and without the governor wrappers.
 **/
export function getTimelockTransactionsForExecution(
  txs: TimelockTxs,
): ForkExecutionCall[] {
  const result: ForkExecutionCall[] = [];
  for (const [i, batch] of txs.queueBatches.entries()) {
    if (batch.length <= 1) {
      throw new Error(`batch ${i} has 1 or less txs`);
    }
    if (batch[0].contractMethod?.name !== "startBatch") {
      throw new Error(`batch ${i} does not start with startBatch`);
    }
    for (let j = 1; j < batch.length; j++) {
      const { contractMethod, contractInputsValues } = batch[j];
      if (contractMethod.name !== "queueTransaction") {
        throw new Error(
          `expected queueTransaction tx ${j} in batch ${i}, got ${contractMethod.name}`,
        );
      }
      const { target, data, value, signature } = contractInputsValues;
      const selector = toFunctionSelector(
        signature.startsWith("function") ? signature : `function ${signature}`,
      );
      result.push({
        to: target as Address,
        callData: data.replace("0x", selector) as Hex,
        value,
        description: signature,
      });
    }
  }
  return result;
}
