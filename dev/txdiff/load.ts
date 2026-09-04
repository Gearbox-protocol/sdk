import { readFileSync } from "node:fs";
import type { TxDump, TxDumpTransaction } from "./types.js";

function isTxDump(v: unknown): v is TxDump {
  return (
    !!v && typeof v === "object" && Array.isArray((v as TxDump).transactions)
  );
}

/**
 * Looks up a transaction by label; throws if missing.
 */
export function txByLabel(dump: TxDump, label: string): TxDumpTransaction {
  const tx = dump.transactions.find(t => t.label === label);
  if (!tx) {
    throw new Error(
      `tx with label "${label}" not found in dump` +
        (dump.description ? ` (${dump.description})` : ""),
    );
  }
  return tx;
}

/**
 * Loads a TxDump from a JSON file.
 */
export function loadTxDump(path: string): TxDump {
  const raw: unknown = JSON.parse(readFileSync(path, "utf-8"));
  if (isTxDump(raw)) {
    return raw;
  }
  throw new Error(`unrecognized tx dump format in ${path}: expected TxDump`);
}
