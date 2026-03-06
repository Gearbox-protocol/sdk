import type { Address, Log, TransactionReceipt } from "viem";
import type { TokenInfo } from "../plugins/adapters/types.js";
import type { ChainContractsRegister } from "../sdk/index.js";
import { assembleOperations } from "./assembleOperations.js";
import { enrichOperations } from "./enrichTokens.js";
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
  /**
   * Underlying token of the pool.
   */
  underlying: Address;
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
 * Token address fields are enriched with metadata (symbol, decimals) from
 * `register.tokensMeta`.
 */
export function parseCreditAccountTransaction(
  input: ParseTransactionInput,
): CreditAccountOperation<TokenInfo>[] {
  const {
    trace,
    receipt,
    pool,
    creditFacade,
    creditAccount,
    underlying,
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
    underlying,
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

  const rawOps: CreditAccountOperation[] = [...facadeOps, ...directOps];

  const resolve = (addr: Address): TokenInfo => {
    const meta = register.tokensMeta.mustGet(addr);
    return { address: addr, symbol: meta.symbol, decimals: meta.decimals };
  };
  return enrichOperations(rawOps, resolve);
}
