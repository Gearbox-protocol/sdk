import type { Address } from "viem";
import type { RawTx } from "../../../../onchain/index.js";
import type { BatchTxs, ParsedMarketTx } from "../market-tx.js";

function getBatchGasLimit(chainId: number): number {
  switch (chainId) {
    default:
      return 14_600_000;
  }
}

export function batchMarketTransactions(args: {
  chainId: number;
  txs: Array<ParsedMarketTx>;
}): BatchTxs[] {
  const { txs, chainId } = args;
  let batchGasUsed = 0;
  let dataUsed = 0;

  const result: Array<BatchTxs> = [];
  const batchTxs: Array<RawTx> = [];

  const batchGasLimit = getBatchGasLimit(chainId);
  const batchTouchedFeeds = new Set<Address>();
  for (const [num, { tx, estimatedGas, touchedFeed }] of txs.entries()) {
    dataUsed += tx.callData.length;

    batchGasUsed += estimatedGas;

    if (touchedFeed) {
      batchTouchedFeeds.add(touchedFeed);
    }

    batchTxs.push(tx);

    const nextTxDataUsed = txs[num + 1]?.tx.callData.length || 0;
    const nextTxGasUsed = txs[num + 1]?.estimatedGas || 0;

    if (
      batchGasUsed + nextTxGasUsed > batchGasLimit ||
      num === txs.length - 1 ||
      // @dev Optimism or Arbitrum
      ([10, 42161].includes(chainId) && dataUsed + nextTxDataUsed > 80_000)
    ) {
      if ([10, 42161].includes(chainId) && dataUsed > 150_000) {
        throw new Error(`Data limit exceeded :${dataUsed}`);
      }

      result.push({
        txs: [...batchTxs],
        estimatedGas: batchGasUsed,
        touchedFeeds: Array.from(batchTouchedFeeds),
      });
      batchGasUsed = 0;
      dataUsed = 0;
      batchTouchedFeeds.clear();

      while (batchTxs.length > 0) {
        batchTxs.pop();
      }
    }
  }

  return result;
}
