import type { Address } from "viem";
import { governorAbi } from "../../../abi/governance/governor.js";
import { createRawTx } from "../../../onchain/index.js";
import type { SafeTx, TimelockTxParams } from "../../bindings/index.js";
import { convertRawTxToSafeMultisigTx } from "./batch.js";

/** Encodes the queue's matching governor execution transaction. */
export function createExecuteBatchRawTx(
  governor: Address,
  queueBatch: readonly SafeTx[],
) {
  const executionBatch = queueBatch
    .filter(tx => tx.contractMethod.name === "queueTransaction")
    .map(tx => ({
      ...tx.contractInputsValues,
      value: BigInt(tx.contractInputsValues.value),
      eta: BigInt(tx.contractInputsValues.eta),
    })) as unknown as Array<TimelockTxParams>;

  return createRawTx(
    governor,
    { abi: governorAbi, functionName: "executeBatch", args: [executionBatch] },
    `ExecuteBatch(${executionBatch
      .map(
        tx =>
          `{
  target: ${tx.target},
  value: ${tx.value.toString()},
  signature: ${tx.signature},
  data: ${tx.data.length > 40 ? `${tx.data.slice(0, 40)}...` : tx.data},
},`,
      )
      .join("\n")})`,
  );
}

export function convertQueueBatchToExecuteTx(queueBatch: SafeTx[]): SafeTx {
  return convertRawTxToSafeMultisigTx(
    createExecuteBatchRawTx(queueBatch[0].to as Address, queueBatch),
  );
}
