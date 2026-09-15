import type { Address } from "viem";
import {
  type MalformedTransactionError,
  type SDKReturn,
  sdkErr,
  sdkOk,
} from "../../../model/index.js";
import type { CreditAccountData, OnchainSDK, PluginsMap } from "../../index.js";
import type { InnerOperation } from "../parse/index.js";
import { CreditAccountState } from "./CreditAccountState.js";
import {
  makeReplayState,
  type ReplayState,
  replayInnerOperations,
} from "./replayInnerOperations.js";

/**
 * Parsed operation whose multicall can be replayed: a facade or RWA
 * opening (empty seed) and close/plain/bot/RWA multicalls on an existing
 * account all fit structurally.
 */
export interface ReplayableOperation {
  creditManager: Address;
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
}

/**
 * Replays the operation's multicall via {@link replayInnerOperations}.
 * When `creditAccount` is omitted, the seed is
 * {@link CreditAccountState.beforeOpen} (a fresh opening).
 */
export function replayMulticall<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  operation: ReplayableOperation,
  creditAccount?: CreditAccountData,
): SDKReturn<ReplayMulticallResult, MalformedTransactionError> {
  const before = creditAccount
    ? CreditAccountState.fromCreditAccountData(creditAccount)
    : CreditAccountState.beforeOpen(
        operation.creditManager,
        sdk.marketRegister.findByCreditManager(operation.creditManager)
          .underlying,
      );
  const after = makeReplayState(before.clone());

  const error = replayInnerOperations(sdk, operation.multicall, after);
  if (error) {
    return sdkErr(error);
  }

  return sdkOk({ before, after });
}
