import type { Address } from "viem";

import type { SecuritizeRegisterMessage } from "../../sdk/index.js";
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

export interface SecuritizeOpenCreditAccountOperation<Ext extends object = {}>
  extends RWAOperationMetadata {
  operation: "SecuritizeOpenCreditAccount";
  multicall: InnerOperation<Ext>[];
  /**
   * DSToken addresses to register, decoded from calldata. Empty in the
   * template flow, where the real value comes from the factory's open-account
   * requirements.
   */
  tokensToRegister: Address[];
  /**
   * EIP-712 registration signatures to store on-chain, decoded from calldata.
   * Empty in the template flow.
   */
  signaturesToCache: SecuritizeRegisterMessage[];
}

/**
 * `SecuritizeRWAFactory.multicall` call: like the facade's `multicall`, plus
 * the factory-specific registration args.
 */
export interface SecuritizeMulticallOperation<Ext extends object = {}>
  extends RWAOperationMetadata {
  operation: "SecuritizeMulticall";
  creditAccount: Address;
  multicall: InnerOperation<Ext>[];
  /** DSToken addresses to register, decoded from calldata. */
  tokensToRegister: Address[];
  /** EIP-712 registration signatures to store on-chain, decoded from calldata. */
  signaturesToCache: SecuritizeRegisterMessage[];
}

/**
 * Discriminated union of all RWA factory operation types. Extend it when
 * adding support for a new RWA factory type.
 */
export type RWAOperation<Ext extends object = {}> =
  | SecuritizeOpenCreditAccountOperation<Ext>
  | SecuritizeMulticallOperation<Ext>;
