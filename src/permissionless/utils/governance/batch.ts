import { type Address, keccak256, toBytes } from "viem";
import type { RawTx } from "../../../sdk/types/index.js";
import type { SafeBatch, SafeTx } from "../../bindings/index.js";

export function convertRawTxToSafeMultisigTx(tx: RawTx): SafeTx {
  const { to, value, contractMethod, contractInputsValues } = tx;
  return {
    to,
    value: `${value}`,
    data: tx.callData,
    contractMethod,
    contractInputsValues: Object.entries(contractInputsValues).reduce(
      (acc, [key, value]) => {
        acc[key] =
          typeof value === "object"
            ? JSON.stringify(value, (_, v) =>
                typeof v === "bigint" ? v.toString() : v,
              )
            : `${value}`;
        return acc;
      },
      {} as Record<string, string>,
    ),
  };
}

function stringifyReplacer(_: string, value: unknown) {
  return value === undefined ? null : `${value}`;
}

function serializeJSONObject(json: unknown): string {
  if (Array.isArray(json)) {
    return `[${json.map(el => serializeJSONObject(el)).join(",")}]`;
  }

  if (typeof json === "object" && json !== null) {
    let acc = "";
    const keys = Object.keys(json).sort();
    acc += `{${JSON.stringify(keys, stringifyReplacer)}`;

    for (const key of keys) {
      acc += `${serializeJSONObject((json as Record<string, unknown>)[key])},`;
    }

    return `${acc}}`;
  }

  return `${JSON.stringify(json, stringifyReplacer)}`;
}

export function calculateChecksum(
  multisigBatch: SafeBatch,
): string | undefined {
  const serialized = serializeJSONObject({
    ...multisigBatch,
    meta: { ...multisigBatch.meta, name: null },
  });
  return keccak256(toBytes(serialized));
}

export function getSafeBatch(args: {
  chainId: number;
  safeAddress: Address;
  name: string;
  txs: SafeTx[];
}): SafeBatch {
  const { chainId, safeAddress, name, txs: transactions } = args;

  const batchInfo = {
    version: "1.0",
    chainId: `${chainId}`,
    createdAt: Date.now(),
    safeAddress: safeAddress,
    meta: {
      name: name,
      description: name,
      txBuilderVersion: "1.16.0",
      createdFromSafeAddress: safeAddress,
      createdFromOwnerAddress: "",
    },
    transactions,
  };

  const batch = {
    ...batchInfo,
    meta: {
      ...batchInfo.meta,
      checksum: calculateChecksum(batchInfo),
    },
  };

  return batch;
}

export function getSafeBatches(args: {
  chainId: number;
  safeAddress: Address;
  name: string;
  batches: SafeTx[][];
}): SafeBatch[] {
  const { batches, name } = args;

  return batches.map((txs, index) => {
    const batchName = `${name}-#${index}`;
    return getSafeBatch({
      ...args,
      name: batchName,
      txs,
    });
  });
}
