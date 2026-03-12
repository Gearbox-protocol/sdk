import type { Address, Hex } from "viem";
import type { TokenTransfer } from "../plugins/adapters/index.js";
import type { ParsedCallV2 } from "../sdk/index.js";

/**
 * A single frame from Ethereum's `debug_traceTransaction` callTracer output.
 * Recursive: each frame may contain nested sub-calls.
 */
export interface CallTrace {
  from: Address;
  to: Address;
  input: Hex;
  output: Hex;
  value: Hex;
  /** "CALL", "DELEGATECALL", "STATICCALL", "CREATE", etc. */
  type: string;
  /** Present when the call reverted (e.g. "execution reverted"). */
  error?: string;
  /** ABI-encoded revert data, if available. */
  revertReason?: Hex;
  calls?: CallTrace[];
}

/**
 * The set of credit facade entry-point functions that produce history operations.
 */
export type FacadeCallType =
  | "MultiCall"
  | "BotMulticall"
  | "OpenCreditAccount"
  | "CloseCreditAccount"
  | "LiquidateCreditAccount"
  | "PartiallyLiquidateCreditAccount";

/**
 * A parsed credit facade call extracted from a call trace,
 * with inner multicall calls already decoded.
 */
export interface FacadeParsedCall {
  operation: FacadeCallType;
  creditAccount: Address;
  /** The full ParsedCallV2 from facade calldata parsing. */
  parsed: ParsedCallV2;
  /** Inner multicall entries from rawArgs.calls (empty for partiallyLiquidateCreditAccount). */
  innerCalls: ParsedCallV2[];
  /** The full call trace node for this facade call (used to extract protocol-level calldata). */
  trace: CallTrace;
}

/**
 * Data extracted from a single Execute event: the ERC-20 transfers that
 * occurred between Execute boundaries and the target contract address.
 */
export interface ExecuteResult {
  transfers: TokenTransfer[];
  targetContract: Address;
}
