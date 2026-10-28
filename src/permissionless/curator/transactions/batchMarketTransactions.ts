import type { Address } from "viem";
import type { RawTx } from "../../../onchain/index.js";
import type { BatchTxs, ParsedMarketTx } from "../types.js";

/** Estimated gas a batch may hold; the same on every supported chain so far. **/
const BATCH_GAS_LIMIT = 14_600_000;

/** Optimism and Arbitrum also bound a batch by its calldata size. **/
const ROLLUP_CHAIN_IDS = [10, 42161];
const ROLLUP_DATA_SOFT_LIMIT = 80_000;
const ROLLUP_DATA_HARD_LIMIT = 150_000;

export function batchMarketTransactions(args: {
  chainId: number;
  txs: ReadonlyArray<
    Pick<ParsedMarketTx, "tx" | "estimatedGas" | "touchedFeeds">
  >;
}): BatchTxs[] {
  const { txs, chainId } = args;
  const isRollup = ROLLUP_CHAIN_IDS.includes(chainId);

  const result: BatchTxs[] = [];
  let batchTxs: RawTx[] = [];
  let batchGasUsed = 0;
  let dataUsed = 0;
  let batchTouchedFeeds = new Set<Address>();

  for (const [num, { tx, estimatedGas, touchedFeeds }] of txs.entries()) {
    batchTxs.push(tx);
    batchGasUsed += estimatedGas;
    dataUsed += tx.callData.length;
    for (const feed of touchedFeeds) {
      batchTouchedFeeds.add(feed);
    }

    const next = txs[num + 1];
    const nextTxGasUsed = next?.estimatedGas ?? 0;
    const nextTxDataUsed = next?.tx.callData.length ?? 0;

    if (
      next === undefined ||
      batchGasUsed + nextTxGasUsed > BATCH_GAS_LIMIT ||
      (isRollup && dataUsed + nextTxDataUsed > ROLLUP_DATA_SOFT_LIMIT)
    ) {
      if (isRollup && dataUsed > ROLLUP_DATA_HARD_LIMIT) {
        throw new Error(`Data limit exceeded :${dataUsed}`);
      }

      result.push({
        txs: batchTxs,
        estimatedGas: batchGasUsed,
        touchedFeeds: [...batchTouchedFeeds],
      });
      batchTxs = [];
      batchGasUsed = 0;
      dataUsed = 0;
      batchTouchedFeeds = new Set();
    }
  }

  return result;
}
