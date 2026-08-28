import type { Address } from "viem";
import type {
  ChainId,
  DataResponse,
  Position,
  PositionFilter,
  PositionWithdrawals,
} from "../../model/index.js";
import type { Asset, CreditAccountData } from "../base/index.js";
import { DUST_THRESHOLD } from "../constants/math.js";
import type {
  BlockNumberProps,
  WithBlock,
  WithMultichain,
} from "../types/index.js";

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

/**
 * Chain-independent part of {@link GetCurrentWithdrawalsProps}.
 *
 * {@link GetCurrentWithdrawalsPropsBase.blockNumber} is kept on the
 * multichain form because the method already targets a single chain.
 **/
export interface GetCurrentWithdrawalsPropsBase {
  /**
   * Credit account whose delayed withdrawals to read.
   **/
  creditAccount: Address;
  /**
   * Block to read at. Defaults to the latest block.
   **/
  blockNumber?: bigint;
}

/**
 * Props for {@link PositionsService.getCurrentWithdrawals}.
 **/
export type GetCurrentWithdrawalsProps<Multichain extends boolean = false> =
  GetCurrentWithdrawalsPropsBase &
    WithMultichain<Multichain, { chainId: ChainId }>;

/**
 * Cross-chain reads of the positions namespace: everything a wallet holds.
 **/
export interface IMultichainPositionsService {
  /**
   * Positions of a wallet on all queried chains.
   **/
  list(props: ListPositionsProps<true>): Promise<DataResponse<Position[]>>;
  /**
   * Delayed withdrawals of one credit account, see
   * {@link PositionsService.getCurrentWithdrawals}.
   **/
  getCurrentWithdrawals(
    props: GetCurrentWithdrawalsProps<true>,
  ): Promise<DataResponse<PositionWithdrawals>>;
}

/**
 * Props for {@link PositionsService.listStrategyPositions}.
 **/
export interface ListStrategyPositionsProps {
  /**
   * Wallet whose credit accounts to describe. RWA accounts are resolved from
   * the investor EOA, see {@link ICreditAccountsService.getBorrowerCreditAccounts}.
   **/
  owner: Address;
  /**
   * Whether to include accounts that carry no debt.
   **/
  includeZeroDebt: boolean;
  /**
   * Block to read at. Defaults to the latest block.
   **/
  blockNumber?: bigint;
}

/**
 * The one input every position-metric function takes: a credit account's
 * state — its credit manager, token balances, quota holdings, total debt and
 * total value in the market's underlying — actual or projected.
 *
 * Everything else (decimals, prices, liquidation thresholds, quota rates,
 * the pool's base rate) is supplied at the calculation site.
 **/
export interface AccountSnapshot {
  /**
   * Credit manager the account is (or will be) opened in.
   **/
  creditManager: Address;
  /**
   * Token balances of the account.
   **/
  assets: Asset[];
  /**
   * Quota holdings of the account: quota balances are denominated in the
   * market's underlying.
   **/
  quotas: Asset[];
  /**
   * Debt principal plus accrued interest and fees, in underlying.
   **/
  totalDebt: bigint;
  /**
   * Total account value in underlying.
   **/
  totalValue: bigint;
}

/**
 * Builds an {@link AccountSnapshot} from on-chain credit account data
 **/
export function accountSnapshotFromCreditAccountData(
  ca: CreditAccountData,
): AccountSnapshot {
  const assets: Asset[] = [];
  const quotas: Asset[] = [];
  for (const t of ca.tokens) {
    if (t.balance <= DUST_THRESHOLD) {
      continue;
    }
    assets.push({ token: t.token, balance: t.balance });
    quotas.push({ token: t.token, balance: t.quota });
  }
  return {
    creditManager: ca.creditManager,
    assets,
    quotas,
    totalDebt: ca.debt + ca.accruedInterest + ca.accruedFees,
    totalValue: ca.totalValue,
  };
}
