import type { Address, Hex } from "viem";

/**
 * One top-level transaction in a fixture / frontend dump.
 * Calldata stays raw — decoding is `txdiff`'s job.
 */
export interface TxDumpTransaction {
  /**
   * Stable label used to pair transactions when diffing
   * (e.g. "open", "request", "claim")
   */
  label: string;
  to: Address;
  /**
   * Raw calldata (viem-style field name)
   */
  data: Hex;
  /**
   * Wei value as a decimal string; omit or "0" when none
   */
  value?: string;
  from?: Address;
}

/**
 * Shared JSON format for generated fixtures and frontend transaction dumps.
 * Order of `transactions` is part of the comparison.
 */
export interface TxDump {
  description?: string;
  chainId?: number;
  transactions: TxDumpTransaction[];
}

/**
 * One decoded call in the multicall tree
 */
export interface DecodedCall {
  target: Address;
  selector: Hex;
  functionName: string;
  /**
   * Human-readable args summary (truncated for display)
   */
  args: string;
  /**
   * Nested MultiCall entries decoded from this call's arguments, if any
   */
  children?: DecodedCall[];
}

/**
 * A fully decoded top-level transaction
 */
export interface DecodedTx {
  label: string;
  to: Address;
  outer: DecodedCall;
  /**
   * Flat list of the first-level multicall entries (outer.children), kept for
   * convenient composition comparison
   */
  calls: DecodedCall[];
}

export interface CompositionMismatch {
  kind: "composition";
  index: number;
  message: string;
}

export interface ArgsDiff {
  kind: "args";
  index: number;
  functionName: string;
  leftArgs: string;
  rightArgs: string;
  /**
   * Optional bigint bps drift when a single numeric arg differs
   */
  bpsDrift?: bigint;
}

export interface DiffResult {
  /**
   * False when any composition mismatch exists
   */
  matches: boolean;
  composition: CompositionMismatch[];
  args: ArgsDiff[];
  lines: string[];
}
