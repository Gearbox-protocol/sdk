import type { Address } from "viem";
import type { SdkWithAdapters } from "../../plugins/adapters/index.js";
import type { PluginsMap } from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";
import type { PreviewOperationOptions } from "../types.js";
import { CreditAccountState } from "./CreditAccountState.js";
import {
  makeReplayState,
  type ReplayState,
  replayInnerOperations,
} from "./replayInnerOperations.js";
import type { OperationPreviewError } from "./types.js";

/**
 * Parsed operation on an existing credit account whose multicall can be
 * replayed: the facade `closeCreditAccount` entry point and
 * plain/bot/RWA multicalls all fit structurally.
 */
export interface ReplayableOperation {
  creditAccount: Address;
  multicall: InnerOperation[];
}

/**
 * Result of {@link replayMulticall}: the account's pre-state and the replayed
 * (minimal guaranteed) post-state.
 */
export interface ReplayMulticallResult {
  /**
   * Account state before the operation, dust-filtered
   */
  before: CreditAccountState;
  /**
   * Post-operation state and per-multicall bookkeeping, mutated by the
   * replay in facade execution order
   */
  after: ReplayState;
  error?: OperationPreviewError;
}

/**
 * Replays the operation's multicall over the account's pre-resolved
 * pre-state (`options.creditAccount`) via {@link replayInnerOperations}.
 */
export async function replayMulticall<P extends PluginsMap>(
  sdk: SdkWithAdapters<P>,
  operation: ReplayableOperation,
  options: PreviewOperationOptions<true>,
): Promise<ReplayMulticallResult> {
  const before = CreditAccountState.fromCreditAccountData(
    options.creditAccount,
  );
  const after = makeReplayState(before.clone());

  const error = await replayInnerOperations(sdk, operation.multicall, after);

  return { before, after, error };
}
