import { isAddressEqual } from "viem";
import {
  AbstractAdapterContract,
  type DelayedWithdrawalRequest,
  type SdkWithAdapters,
} from "../../plugins/adapters/index.js";
import {
  type Asset,
  type DelayedIntent,
  decodeDelayedIntent,
  type PluginsMap,
} from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";
import { InvalidDelayedIntentError } from "./errors.js";

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
 * @param sdk - SDK with the adapters plugin attached.
 * @param multicall - Parsed inner operations of the multicall.
 * @returns The detected request, or `undefined` when
 * the multicall contains no delayed-withdrawal request.
 * @throws InvalidDelayedIntentError when a request carries non-empty
 * `extraData` that cannot be decoded as a `DelayedIntent`.
 */
export function detectDelayedOperation<P extends PluginsMap>(
  sdk: SdkWithAdapters<P>,
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
        throw new InvalidDelayedIntentError(op.adapter, request.extraData, e);
      }
    }
    return { request, intent };
  }
  return undefined;
}
