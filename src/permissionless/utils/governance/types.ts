import type { Address } from "viem";
import type { SafeTx } from "../../bindings/index.js";

export interface TimelockTxs {
  chainId: number;
  eta: number;
  author: Address;
  marketConfigurator: Address;
  createdAtBlock: number;
  queueBatches: SafeTx[][];
  updatableFeeds?: Address[][];
}

export interface InstanceTxs {
  chainId: number;
  author: Address;
  instanceManager: Address;
  batches: SafeTx[][];
  createdAtBlock?: number;
  updatableFeeds?: Address[][];
}
