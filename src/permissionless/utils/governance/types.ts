import { Address } from "viem";
import { SafeTx } from "../../bindings";

export interface TimelockTxs {
  chainId: number;
  eta: number;
  author: Address;
  marketConfigurator: Address;
  createdAtBlock: number;
  queueBatches: SafeTx[][];
}

export interface InstanceTxs {
  chainId: number;
  author: Address;
  instanceManager: Address;
  batches: SafeTx[][];
}
