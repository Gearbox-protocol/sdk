import type { Address } from "viem";
import {
  AbstractAdapterContract,
  type SdkWithAdapters,
} from "../../plugins/adapters/index.js";
import type { DelayedIntent, PluginsMap } from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";

/**
 * A delayed-withdrawal claim detected in a credit-facade multicall,
 * produced by `detectDelayedClaim`.
 */
export interface DetectedDelayedClaim {
  /**
   * Adapter the claim call is addressed to
   */
  adapter: Address;
  /**
   * Redeemer contract the withdrawal is claimed from. Transactions built by
   * the withdrawal compressor always claim from a single redeemer, so when
   * the adapter method accepts multiple redeemers, only the first one is
   * reported.
   */
  redeemer: Address;
}

/**
 * Scans a credit-facade multicall for a delayed-withdrawal claim call.
 *
 * @param sdk - SDK with the adapters plugin attached.
 * @param multicall - Parsed inner operations of the multicall.
 * @returns The detected claim, or `undefined` when the multicall contains no
 * delayed-withdrawal claim call.
 */
export function detectDelayedClaim<P extends PluginsMap>(
  sdk: SdkWithAdapters<P>,
  multicall: InnerOperation[],
): DetectedDelayedClaim | undefined {
  for (const op of multicall) {
    if (op.operation !== "Execute") {
      continue;
    }
    const adapter = sdk.getContract(op.adapter);
    if (!(adapter instanceof AbstractAdapterContract)) {
      continue;
    }
    const claim = adapter.parseDelayedWithdrawalClaim(op.calldata);
    if (claim) {
      return { adapter: op.adapter, redeemer: claim.redeemer };
    }
  }
  return undefined;
}

/**
 * Resolves the delayed intent of the withdrawal a multicall claims: detects
 * the claim call and reads the recorded intent of the claimed redeemer from
 * the `RedemptionLogger` contract.
 *
 * @param sdk - SDK with the adapters plugin attached.
 * @param multicall - Parsed inner operations of the multicall.
 * @param blockNumber - Optional block number to read the log at.
 * @returns The decoded intent, or `undefined` when the multicall claims
 * nothing, the redemption logger is not deployed, or the log carries no
 * intent.
 * @throws InvalidDelayedIntentError when the logged `extraData` is non-empty
 * but cannot be decoded as a `DelayedIntent`.
 */
export async function resolveDelayedClaimIntent<P extends PluginsMap>(
  sdk: SdkWithAdapters<P>,
  multicall: InnerOperation[],
  blockNumber?: bigint,
): Promise<DelayedIntent | undefined> {
  const claim = detectDelayedClaim(sdk, multicall);
  if (!claim) {
    return undefined;
  }
  return sdk.redemptionLogger?.getDelayedIntent(claim.redeemer, blockNumber);
}
