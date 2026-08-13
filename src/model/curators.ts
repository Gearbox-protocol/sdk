import type { Address } from "viem";

/**
 * Known curator names that manage Gearbox markets.
 **/
export type CuratorName =
  | "Chaos Labs"
  | "K3"
  | "cp0x"
  | "Re7"
  | "Invariant Group"
  | "Tulipa"
  | "M11 Credit"
  | "KPK"
  | "Hyperithm"
  | "UltraYield"
  | "TelosC"
  | "Gami Labs"
  | "Securitize"
  | "Testnet Curator"; // without governor, for midas

/**
 * The entity that curates a market: sets risk parameters, picks collateral and
 * operates the market configurator.
 **/
export interface Curator {
  /**
   * Address of the market configurator the curator operates. This is the
   * on-chain identity of a curator, not a personal wallet.
   **/
  address: Address;
  /**
   * Display name from the curated per-chain table, or `undefined` when the
   * market configurator is not a well-known curator.
   *
   * @example `"Chaos Labs"`
   **/
  name?: CuratorName;
  /**
   * Link to the curator's page, or `null` when unknown. The chain knows no
   * URLs, so this is `null` for anything served from the on-chain source.
   *
   * @mode offchain
   **/
  url: string | null;
}
