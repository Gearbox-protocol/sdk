import type { Address } from "viem";
import type { AdapterProtocolOperation } from "../../plugins/adapters/index.js";

/**
 * A single ERC-20 Transfer event captured between Execute boundaries.
 *
 * Canonical, public definition owned by the `preview` module; `plugins/adapters`
 * keeps a structurally identical internal copy for its legacy helpers.
 */
export interface TokenTransfer {
  token: Address;
  amount: bigint;
  from: Address;
  to: Address;
}

/**
 * Pure adapter-call descriptor: everything that can be recovered without an
 * execution trace (from raw calldata alone).
 */
export interface AdapterOperationBase {
  operation: "Execute";
  /**
   * Address of Gearbox Adapter contract
   */
  adapter: Address;
  /**
   * Namespaced adapter type
   * E.g. "ADAPTER::FLUID_DEX"
   */
  adapterType: string;
  /**
   * Adapter contract version
   */
  version: number;
  /**
   * Label of protocol contract (NOT adapter contract)
   */
  label?: string;
  /**
   * Function name of adapter contract
   */
  adapterFunctionName: string;
  /**
   * Arguments of adapter contract
   */
  adapterArgs: Record<string, unknown>;
}

/**
 * Adapter `Execute` operation, generic over the extra data added by consumers.
 *
 * - calldata-only parse uses `Ext = {}` (pure descriptor);
 * - trace-based flows (history, facade simulation) use {@link TraceAdapterExt};
 * - history additionally intersects `{ legacy: LegacyAdapterOperation }`.
 */
export type AdapterOperation<Ext extends object = {}> = AdapterOperationBase &
  Ext;

/**
 * Trace-derived adapter data: the protocol-level call and the ERC-20 transfers
 * made during the adapter call. Both are only available from an execution
 * trace, so they always travel together.
 *
 * `protocol` is optional: it is absent when no external protocol call was
 * recovered for the adapter `Execute`. This happens for the account-migrator
 * adapter (its `execute` targets the migrator bot, not an external protocol),
 * for unknown adapters in non-strict mode (no ABI to decode against), and when
 * the protocol calldata cannot be decoded.
 */
export interface TraceAdapterExt {
  protocol?: AdapterProtocolOperation;
  transfers: TokenTransfer[];
}
