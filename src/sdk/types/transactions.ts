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

/**
 * Wrapper interface for RawTx with diagnostic data
 */
export interface IPriceUpdateTx<
  Data extends { timestamp: number; priceFeed: Address } = {
    priceFeed: Address;
    timestamp: number;
  },
> {
  raw: RawTx;
  data: Data;
  pretty: string;
  validateTimestamp: (timestamp: bigint) => "valid" | "too old" | "in future";
}

export interface MultiCall {
  target: Address;
  callData: Hex;
}
