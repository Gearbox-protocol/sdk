import type { Address, Hex } from "viem";
import type { ParsedCall } from "../../sdk/index.js";

export interface Signature {
  signer: Address;
  signature: Hex;
}

export interface CrossChainCall {
  chainId: number;
  callData: Hex;
  target: Address;
}

export interface Batch {
  name: string;
  prevHash: Hex;
  calls: CrossChainCall[];
  parsedCalls: ParsedCall[];
  hash: Hex;
  signatures: Signature[];
  timestamp?: number;
  transactionHash?: Hex;
  blockNumber?: number;
}

export interface RecoveryMessage {
  chainId: number;
  startingBatchHash: Hex;
  signatures: Signature[];
}
