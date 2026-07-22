import type { Address } from "viem";
import type { CallTrace } from "../../common-utils/utils/trace.js";
import type { ParsedCallV2 } from "../../sdk/index.js";

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
