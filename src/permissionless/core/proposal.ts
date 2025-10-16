import { Address, Hex } from "viem";

export interface Signature {
  signer: Address;
  signature: Hex;
}

export interface CrossChainCall {
  chainId: number;
  callData: Hex;
  target: Address;
}

export interface ParsedCall {
  chainId: number;
  target: Address;
  label: string;
  functionName: string;
  args: Record<string, string>;
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
