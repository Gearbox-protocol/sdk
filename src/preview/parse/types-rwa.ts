import type { Address } from "viem";

import type { RWAOperationArgs } from "../../sdk/index.js";
import type { InnerOperation } from "./types-facades.js";

/**
 * Metadata shared by all RWA factory operations. RWA credit accounts are
 * opened and managed through the market's RWA factory rather than the credit
 * facade, but the inner `calls` still target the facade/adapters, so the
 * credit suite is known.
 */
export interface RWAOperationMetadata {
  /** RWA factory contract the transaction is sent to. */
  factory: Address;
  creditManager: Address;
  creditFacade: Address;
}

export interface RWAOpenCreditAccountOperation<Ext extends object = {}>
  extends RWAOperationMetadata {
  operation: "RWAOpenCreditAccount";
  multicall: InnerOperation<Ext>[];
  /**
   * Factory-specific registration args decoded from calldata (for
   * Securitize: `tokensToRegister`/`signaturesToCache`).
   */
  args: RWAOperationArgs;
}

export interface RWAMulticallOperation<Ext extends object = {}>
  extends RWAOperationMetadata {
  operation: "RWAMulticall";
  creditAccount: Address;
  multicall: InnerOperation<Ext>[];
  /** Factory-specific registration args decoded from calldata. */
  args: RWAOperationArgs;
}

/**
 * Discriminated union of all RWA factory operation types. Extend it when
 * adding support for a new RWA factory type.
 */
export type RWAOperation<Ext extends object = {}> =
  | RWAOpenCreditAccountOperation<Ext>
  | RWAMulticallOperation<Ext>;
