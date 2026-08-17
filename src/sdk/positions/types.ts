import type { Address } from "viem";
import type { PositionFilter } from "../../model/index.js";
import type { BlockNumberProps, WithBlock } from "../types/index.js";

/**
 * Chain-independent part of {@link ListPositionsProps}.
 *
 * Chain scoping is expressed by {@link PositionFilter.chainIds} rather than by
 * the `networks` prop of the other multichain services.
 **/
export interface ListPositionsPropsBase {
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

/**
 * Props for {@link PositionsService.list}.
 *
 * {@link BlockNumberProps.blockNumber} is only on the single-chain form: a
 * height is not shared across the networks of the fan-out, see
 * {@link MultichainPositionsService.list}.
 **/
export type ListPositionsProps<Multichain extends boolean = false> =
  ListPositionsPropsBase & WithBlock<Multichain>;
