import type { Address, Hex, PublicClient } from "viem";
import { iTimeLockAbi } from "../../../abi/governance/iTimeLock.js";
import { BaseContract } from "../base-contract.js";
import type { QueuedAndExecutedTransaction } from "./types.js";

export class TimeLockContract extends BaseContract<typeof iTimeLockAbi> {
  constructor(address: Address, client: PublicClient) {
    super(iTimeLockAbi, address, client, "TimeLock");
  }

  async admin(): Promise<Address> {
    const admin = await this.client.readContract({
      address: this.address,
      abi: iTimeLockAbi,
      functionName: "admin",
    });

    return admin as Address;
  }

  async getGracePeriod(): Promise<bigint> {
    return this.contract.read.GRACE_PERIOD();
  }

  async getQueuedAndExecutedTransactions(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<QueuedAndExecutedTransaction> {
    const [executedEvents, queuedEvents, cancelledEvents] = await Promise.all([
      this.getEvents("ExecuteTransaction", fromBlock, toBlock),
      this.getEvents("QueueTransaction", fromBlock, toBlock),
      this.getEvents("CancelTransaction", fromBlock, toBlock),
    ]);

    const toBlockTimestamp = await this.client
      .getBlock({ blockNumber: toBlock })
      .then(block => block.timestamp);
    const gracePeriod = await this.getGracePeriod();

    // Create a set of transaction hashes that have been executed or cancelled
    const processedTxHashes = new Set([
      ...executedEvents.map(event => event.args.txHash),
      ...cancelledEvents.map(event => event.args.txHash),
    ]);

    // Create a set of queued transaction hashes
    const queuedTxHashes = new Set(
      queuedEvents.map(event => event.args.txHash),
    );

    // Filter out queued events that have been processed
    const remainingQueuedEvents = queuedEvents.filter(event => {
      const cancelledOrExecuted = processedTxHashes.has(event.args.txHash);
      const expired = event.args.eta
        ? toBlockTimestamp > event.args.eta + gracePeriod
        : true;
      return !cancelledOrExecuted && !expired;
    });

    // Find canceled events that don't have corresponding queued events
    const orphanedCanceledEvents = cancelledEvents.filter(
      event => !queuedTxHashes.has(event.args.txHash),
    );

    return {
      executed: executedEvents.map(event => ({
        txHash: event.args.txHash as Hex,
        txParams: {
          target: event.args.target as Address,
          value: event.args.value as bigint,
          data: event.args.data as Hex,
          signature: event.args.signature as string,
          eta: event.args.eta as bigint,
        },
        blockNumber: event.blockNumber,
      })),
      queued: remainingQueuedEvents.map(event => ({
        txHash: event.args.txHash as Hex,
        txParams: {
          target: event.args.target as Address,
          value: event.args.value as bigint,
          data: event.args.data as Hex,
          signature: event.args.signature as string,
          eta: event.args.eta as bigint,
        },
        blockNumber: event.blockNumber,
      })),
      canceled: orphanedCanceledEvents.map(event => ({
        txHash: event.args.txHash as Hex,
        txParams: {
          target: event.args.target as Address,
          value: event.args.value as bigint,
          data: event.args.data as Hex,
          signature: event.args.signature as string,
          eta: event.args.eta as bigint,
        },
        blockNumber: event.blockNumber,
      })),
    };
  }
}
