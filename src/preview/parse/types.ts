import type { Address } from "viem";
import type { OuterFacadeOperation } from "../../history/index.js";
import type {
  AdaptersPlugin,
  TokenTransfer,
} from "../../plugins/adapters/index.js";
import type { OnchainSDK, PluginsMap } from "../../sdk/index.js";

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
 * ERC4626 `deposit` into a Gearbox pool.
 * Token metadata (symbol/decimals) is intentionally omitted: consumers resolve
 * it from `sdk.tokensMeta` using the token addresses below.
 */
export interface PoolDepositOperation {
  operation: "Deposit";
  pool: Address;
  receiver: Address;
  /** Underlying assets supplied to the pool. */
  assets: bigint;
  underlying: Address;
  /** Referral code, present only for `depositWithReferral` calls. */
  referralCode?: bigint;
  /**
   * ERC-20 transfers involving the wallet, recovered by simulating the call.
   * Empty for the calldata-only parse; populated by the simulation stage.
   */
  transfers: TokenTransfer[];
}

/**
 * ERC4626 `redeem` from a Gearbox pool.
 * Token metadata (symbol/decimals) is intentionally omitted: consumers resolve
 * it from `sdk.tokensMeta` using the token addresses below.
 */
export interface PoolRedeemOperation {
  operation: "Redeem";
  pool: Address;
  receiver: Address;
  owner: Address;
  /** Pool shares (diesel) burned. */
  shares: bigint;
  underlying: Address;
  /**
   * ERC-20 transfers involving the wallet, recovered by simulating the call.
   * Empty for the calldata-only parse; populated by the simulation stage.
   */
  transfers: TokenTransfer[];
}

export type PoolOperation = PoolDepositOperation | PoolRedeemOperation;

/**
 * Narrows an {@link Operation} to a {@link PoolOperation} (deposit or redeem).
 * Used by the UI to decide whether a custom view exists for the parsed result;
 * everything else falls back to the raw JSON view.
 */
export function isPoolOperation(tx: Operation): tx is PoolOperation {
  return tx.operation === "Deposit" || tx.operation === "Redeem";
}

/**
 * Result of decoding a single raw operation calldata: either a pool
 * deposit/redeem or one of the credit-facade operations from `sdk/history`.
 */
export type Operation = PoolOperation | OuterFacadeOperation;
