import type { Hex, PrivateKeyAccount, TransactionReceipt } from "viem";
import type { RawTx } from "../onchain/index.js";
import { sendRawTx } from "../onchain/index.js";
import type { AnvilClient } from "./createAnvilClient.js";

/** A mined transaction whose receipt was already checked for a revert. */
export interface ConfirmedTransaction {
  hash: Hex;
  receipt: TransactionReceipt;
}

/**
 * A transaction was mined but reverted. Carries the operation that was being
 * performed and the hash, so the fork can be inspected after the fact.
 */
export class TransactionRevertedError extends Error {
  public override readonly name = "TransactionRevertedError";
  public readonly hash: Hex;
  public readonly operation: string;

  constructor(operation: string, hash: Hex) {
    super(`${operation} reverted, tx ${hash}`);
    this.operation = operation;
    this.hash = hash;
  }
}

/**
 * Shared receipt validation: returns the confirmed transaction, or throws a
 * {@link TransactionRevertedError} naming `operation` and the hash.
 */
export function assertConfirmed(
  operation: string,
  hash: Hex,
  receipt: TransactionReceipt,
): ConfirmedTransaction {
  if (receipt.status === "reverted") {
    throw new TransactionRevertedError(operation, hash);
  }
  return { hash, receipt };
}

export interface SendAndConfirmParams {
  tx: Pick<RawTx, "to" | "callData" | "value">;
  account: PrivateKeyAccount;
  /** Human readable description used in the revert error, e.g. "open account" */
  operation: string;
}

/**
 * Broadcasts an SDK-built transaction through the fork, waits for it and
 * fails loudly when it reverted.
 */
export async function sendAndConfirm(
  anvil: AnvilClient,
  { tx, account, operation }: SendAndConfirmParams,
): Promise<ConfirmedTransaction> {
  const hash = await sendRawTx(anvil, { tx, account });
  const receipt = await anvil.waitForTransactionReceipt({ hash });
  return assertConfirmed(operation, hash, receipt);
}

/**
 * Direct contract write (approvals, mints, transfers) that reuses the same
 * receipt validation as {@link sendAndConfirm}.
 */
export async function writeAndConfirm(
  anvil: AnvilClient,
  operation: string,
  params: Parameters<AnvilClient["writeContract"]>[0],
): Promise<ConfirmedTransaction> {
  const hash = await anvil.writeContract(params);
  const receipt = await anvil.waitForTransactionReceipt({ hash });
  return assertConfirmed(operation, hash, receipt);
}
