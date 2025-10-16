import type { Address, Hash, PublicClient } from "viem";
import { batchesChainAbi } from "../../../abi/governance/batchesChain.js";
import type { RawTx } from "../../../sdk/types/index.js";
import { BaseContract } from "../base-contract";

const abi = batchesChainAbi;

export class BatchesChainContract extends BaseContract<typeof abi> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "BatchesChain");
  }

  createBatchOrderingTx(prevHash: Hash): RawTx {
    return this.createRawTx({
      functionName: "revertIfQueued",
      args: [prevHash],
    });
  }
}
