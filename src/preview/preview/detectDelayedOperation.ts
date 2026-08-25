import { isAddressEqual } from "viem";
import type { DelayedIntent } from "../../model/index.js";
import {
  AbstractAdapterContract,
  type Asset,
  type DelayedWithdrawalRequest,
  decodeDelayedIntent,
  InvalidDelayedIntentError,
  type OnchainSDK,
  type PluginsMap,
} from "../../onchain/index.js";
import type { InnerOperation } from "../parse/index.js";

/**
 * A delayed-withdrawal request detected in a credit-facade multicall,
 * produced by `detectDelayedOperation`.
 */
export interface DetectedDelayedOperation {
  /**
   * Phantom/claim tokens from the adapter's `parseDelayedWithdrawalRequest`
   */
  request: DelayedWithdrawalRequest;
  /**
   * Decoded delayed intent; undefined when the request carries none, in
   * which case the delayed preview is claim-only
   */
  intent?: DelayedIntent;
}

/**
 * Scans a credit-facade multicall for a delayed-withdrawal request.
 *
 * @param sdk - Attached SDK.
 * @param multicall - Parsed inner operations of the multicall.
 * @returns The detected request, or `undefined` when
 * the multicall contains no delayed-withdrawal request.
 * @throws InvalidDelayedIntentError when a request carries non-empty
 * `extraData` that cannot be decoded as a `DelayedIntent`.
 */
export function detectDelayedOperation<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  multicall: InnerOperation[],
): DetectedDelayedOperation | undefined {
  // Deltas of the current storeExpectedBalances/compareBalances bracket
  let bracketDeltas: Asset[] = [];
  for (const op of multicall) {
    if (op.operation === "StoreExpectedBalances") {
      bracketDeltas = op.deltas;
      continue;
    }
    if (op.operation === "CompareBalances") {
      bracketDeltas = [];
      continue;
    }
    if (op.operation !== "Execute") {
      continue;
    }
    const adapter = sdk.getContract(op.adapter);
    if (!(adapter instanceof AbstractAdapterContract)) {
      continue;
    }
    const request = adapter.parseDelayedWithdrawalRequest(op.calldata);
    if (!request) {
      continue;
    }
    // A matched request method alone does not imply a delayed withdrawal: e.g.
    // Mellow emits the exact same `redeem` call when the vault serves the
    // withdrawal fully instantly (no phantom minted). The detection is therefore
    // gated on the phantom token appearing as a positive delta in the
    // `storeExpectedBalances` bracket enclosing the request call
    const mintsPhantom = bracketDeltas.some(
      ({ token, balance }) =>
        balance > 0n && isAddressEqual(token, request.phantomToken),
    );
    if (!mintsPhantom) {
      continue;
    }

    let intent: DelayedIntent | undefined;
    if (request.extraData && request.extraData !== "0x") {
      try {
        intent = decodeDelayedIntent(request.extraData);
      } catch (e) {
        throw new InvalidDelayedIntentError(request.extraData, e);
      }
    }
    return { request, intent };
  }
  return undefined;
}
