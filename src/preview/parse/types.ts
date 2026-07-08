import type { AdaptersPlugin } from "../../plugins/adapters/index.js";
import type { OnchainSDK, PluginsMap } from "../../sdk/index.js";

import type { OuterFacadeOperation } from "./types-facades.js";
import type { PoolOperation } from "./types-pools.js";
import type { RWAOperation } from "./types-rwa.js";

export * from "./types-adapters.js";
export * from "./types-facades.js";
export * from "./types-pools.js";
export * from "./types-rwa.js";

/**
 * True when the plugin map `P` contains the {@link AdaptersPlugin} under any
 * key. Matched nominally (the plugin's private fields make it non-structural),
 * so unrelated plugins never satisfy it.
 */
export type HasAdaptersPlugin<P extends PluginsMap> =
  Extract<P[keyof P], AdaptersPlugin> extends never ? false : true;

/**
 * Compile-time guard for the adapters plugin. Resolves to a no-op (`unknown`)
 * when `P` includes the {@link AdaptersPlugin}, otherwise to an error-shaped
 * type that makes the surrounding call fail to type-check.
 *
 * Intended to be intersected with a function argument so callers must pass an
 * SDK whose adapter contracts are registered (required for multicall
 * classification).
 */
export type RequireAdaptersPlugin<P extends PluginsMap> =
  HasAdaptersPlugin<P> extends true
    ? unknown
    : { "OnchainSDK must be created with the AdaptersPlugin": never };

/**
 * {@link OnchainSDK} whose plugin map is guaranteed at compile time to include
 * the {@link AdaptersPlugin}.
 */
export type SdkWithAdapters<P extends PluginsMap = PluginsMap> = OnchainSDK<P> &
  RequireAdaptersPlugin<P>;

/**
 * Result of decoding a single raw operation calldata: a pool deposit/redeem,
 * one of the credit-facade operations, or an RWA-factory operation.
 */
export type Operation = PoolOperation | OuterFacadeOperation | RWAOperation;

/**
 * Narrows an {@link Operation} to a {@link PoolOperation} (deposit, mint,
 * withdraw or redeem). Used by the UI to decide whether a custom view exists for
 * the parsed result; everything else falls back to the raw JSON view.
 */
export function isPoolOperation(tx: Operation): tx is PoolOperation {
  return (
    tx.operation === "Deposit" ||
    tx.operation === "Mint" ||
    tx.operation === "Withdraw" ||
    tx.operation === "Redeem"
  );
}

/**
 * Narrows an {@link Operation} to an {@link RWAOperation} (an RWA-factory
 * open-account or multicall). Used to route parsed operations to the
 * RWA-specific simulation path.
 */
export function isRWAOperation(tx: Operation): tx is RWAOperation {
  return (
    tx.operation === "RWAOpenCreditAccount" || tx.operation === "RWAMulticall"
  );
}
