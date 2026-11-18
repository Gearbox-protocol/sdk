import type { Hash, TransactionReceipt } from "viem";
import { WaitForTransactionReceiptTimeoutError } from "viem";
import type { AnvilClient } from "../../../dev/createAnvilClient.js";
import { DEFAULT_FORK_TIMEOUT_MS } from "../session/forkConnection.js";

/** How often the receipt is looked up; the node is local. **/
const RECEIPT_POLL_MS = 100;

/**
 * The receipt of a transaction sent to an automining Anvil node, looked up
 * until the node has it.
 *
 * viem's `waitForTransactionReceipt` looks the receipt up once per new block.
 * Right after mining, Anvil can report the new block number before the
 * transaction's receipt is readable, and on an automining node no further
 * block follows the last transaction: a lookup that lands in that window
 * waits for a block that never comes, and times out on a mined transaction.
 *
 * @throws {@link WaitForTransactionReceiptTimeoutError} after `timeoutMs`
 **/
export async function waitForAnvilReceipt(
  anvil: AnvilClient,
  hash: Hash,
  timeoutMs: number = DEFAULT_FORK_TIMEOUT_MS,
): Promise<TransactionReceipt> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      return await anvil.getTransactionReceipt({ hash });
    } catch (error) {
      // Matched by name: a caller's second copy of viem defines its own class.
      if ((error as Error).name !== "TransactionReceiptNotFoundError") {
        throw error;
      }
    }
    if (Date.now() >= deadline) {
      throw new WaitForTransactionReceiptTimeoutError({ hash });
    }
    await new Promise(resolve => setTimeout(resolve, RECEIPT_POLL_MS));
  }
}
