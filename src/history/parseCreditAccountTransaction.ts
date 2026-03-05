import type { Address, Log, TransactionReceipt } from "viem";
import type { ChainContractsRegister } from "../sdk/index.js";
import { assembleOperations } from "./assembleOperations.js";
import { extractTransfers } from "./extractTransfers.js";
import { findFacadeCalls } from "./findFacadeCalls.js";
import type { CallTrace } from "./internal-types.js";
import type {
  CreditAccountOperation,
  DirectTokenTransferOperation,
} from "./types.js";

type RawLog = Log<bigint | number, number, false>;

export interface ParseTransactionInput {
  /**
   * Output of `debug_traceTransaction`
   */
  trace: unknown;
  receipt: Pick<
    TransactionReceipt<bigint | number>,
    "logs" | "transactionHash" | "blockNumber"
  >;
  pool: Address;
  creditFacade: Address;
  creditAccount: Address;
  register: ChainContractsRegister;
  /**
   * Whether to throw an error if an unknown adapter/protocol is encountered.
   */
  strict?: boolean;
}

/**
 * Parses a single transaction into classified credit account operations.
 *
 */
export function parseCreditAccountTransaction(
  input: ParseTransactionInput,
): CreditAccountOperation[] {
  const {
    trace,
    receipt,
    pool,
    creditFacade,
    creditAccount,
    register,
    strict,
  } = input;
  const logs = receipt.logs as unknown as RawLog[];
  const txHash = receipt.transactionHash;
  const blockNumber = Number(receipt.blockNumber);

  const facadeCalls = findFacadeCalls(
    trace as CallTrace,
    creditFacade,
    creditAccount,
    register,
    strict,
  );

  const {
    executeResults,
    directTransfers,
    liquidationRemainingFunds,
    phantomTokens,
  } = extractTransfers(logs, creditAccount, pool, creditFacade);

  const facadeOps = assembleOperations({
    facadeCalls,
    executeResults,
    register,
    txHash,
    blockNumber,
    liquidationRemainingFunds,
    phantomTokens,
    strict,
  });

  const directOps: DirectTokenTransferOperation[] = directTransfers.map(dt => ({
    operation: "DirectTokenTransfer" as const,
    txHash,
    blockNumber,
    creditAccount,
    ...dt,
  }));

  return [...facadeOps, ...directOps];
}
