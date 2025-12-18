import type { Address, Hex } from "viem";
import type { ContractMethod } from "../../../sdk/index.js";

// @note Safe txs and bathes types
export interface SafeTx {
  to: string;
  value: string;
  data: Hex;
  contractMethod: ContractMethod;
  contractInputsValues: Record<string, string>;
}

export interface SafeMeta {
  txBuilderVersion?: string;
  checksum?: string;
  createdFromSafeAddress?: string;
  createdFromOwnerAddress?: string;
  name: string;
  description?: string;
}

export interface SafeBatch {
  version: string;
  chainId: string;
  createdAt: number;
  meta: SafeMeta;
  transactions: SafeTx[];
  safeAddress: Address;
}

// @note Timelock txs types
export interface TimelockTxParams {
  target: Address;
  value: bigint;
  data: Hex;
  signature: string;
  eta: bigint;
}

export interface TimelockTransaction {
  txHash: Hex;
  txParams: TimelockTxParams;
  blockNumber: bigint;
}

export interface QueuedAndExecutedTransaction {
  executed: TimelockTransaction[];
  queued: TimelockTransaction[];
  canceled: TimelockTransaction[];
}
