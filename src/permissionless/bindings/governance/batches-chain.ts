import type { Address, Chain, Hash, PublicClient, Transport } from "viem";
import { batchesChainAbi } from "../../../abi/governance/batchesChain.js";
import { BaseContract, type RawTx } from "../../../sdk/index.js";

const abi = batchesChainAbi;

export class BatchesChainContract extends BaseContract<typeof abi> {
  constructor(addr: Address, client: PublicClient<Transport, Chain>) {
    super({ client }, { abi, addr, name: "BatchesChain" });
  }

  createBatchOrderingTx(prevHash: Hash): RawTx {
    return this.createRawTx({
      functionName: "revertIfQueued",
      args: [prevHash],
    });
  }
}
