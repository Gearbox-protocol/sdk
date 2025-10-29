import type { Address } from "viem";
import { governorAbi } from "../../../abi/governance/governor.js";
import { createRawTx } from "../../../sdk/utils/index.js";
import type { SafeTx, TimelockTxParams } from "../../bindings/index.js";
import { convertRawTxToSafeMultisigTx } from "./batch.js";

export function convertQueueBatchToExecuteTx(queueBatch: SafeTx[]): SafeTx {
  const executionBatch = queueBatch
    .filter(tx => tx.contractMethod.name === "queueTransaction")
    .map(tx => ({
      ...tx.contractInputsValues,
      value: BigInt(tx.contractInputsValues.value),
      eta: BigInt(tx.contractInputsValues.eta),
    })) as unknown as Array<TimelockTxParams>;

  return convertRawTxToSafeMultisigTx(
    createRawTx(queueBatch[0].to as Address, {
      functionName: "executeBatch",
      args: [executionBatch],
      abi: governorAbi,
    }),
  );
}
