import type { Address, Hex } from "viem";

export interface ContractMethod {
  inputs: any[];
  name: string;
  payable: boolean;
}

export interface RawTx {
  to: Address;
  value: string;
  signature: string;
  callData: Hex;
  contractMethod: ContractMethod;
  contractInputsValues: Record<string, any>;
  description?: string;
}

export interface MultiCall {
  target: Address;
  callData: Hex;
}

export interface ReadContractOptions {
  blockNumber?: bigint;
}
