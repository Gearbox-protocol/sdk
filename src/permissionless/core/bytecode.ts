import type { Address, Hex } from "viem";

export interface Bytecode {
  bytecodeHash: Hex;
  contractType: string;
  version: number;
  author: Address;
  initCode: Hex;
  size: number;
  uploadedAt: number;
  source: string;
  transactionHash: Hex;
  blockNumber: number;
}

export interface BytecodeShort
  extends Omit<
    Bytecode,
    "initCode" | "transactionHash" | "blockNumber" | "source" | "author"
  > {
  auditorNames: string[];
}

export interface BytecodeExtended extends Bytecode {
  deployments: Deployment[];
  audits: Audit[];
}

export interface Audit {
  report: string;
  auditor: Address;
  auditorName: string;
  isAuditorRemoved: boolean;
  timestamp: number;
}

export interface AuditEvent {
  reportUrl: string;
  auditor: Address;
  bytecodeHash: Hex;
  signature: Hex;
  timestamp: number;
  transactionHash: Hex;
  blockNumber: number;
}

export interface Deployment {
  chainId: number;
  address: Address;
  txHash: Hex;
  blockNumber: number;
  timestamp: number;
}

export interface DeploymentExtended extends Deployment {
  bytecodeHash: Hex;
}
