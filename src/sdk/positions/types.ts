import type { Address } from "viem";
import type { PositionFilter } from "../../model/index.js";

/**
 * Props for {@link PositionsService.list}.
 *
 * Chain scoping is expressed by {@link PositionFilter.chainIds} rather than by
 * the `networks` prop of the other multichain services, so the props are the
 * same on both, see {@link MultichainPositionsService.list}.
 **/
export interface ListPositionsProps {
  /**
   * Wallet whose positions to list. Every kind of position belongs to a wallet:
   * pool shares and credit accounts to their holder, delayed withdrawals to the
   * liquidator that took them over.
   **/
  wallet: Address;
  /**
   * Optional narrowing, see {@link PositionFilter}.
   **/
  filter?: PositionFilter;
}
