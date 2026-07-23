import type { Address } from "viem";
import type { Asset, CreditAccountData, IBaseContract } from "../base/index.js";
import type { MultiCall } from "../types/index.js";

/**
 * Type of swap the router should perform.
 *
 * - `"EXACT_INPUT"` — swap an exact amount of the input token.
 * - `"EXACT_INPUT_ALL"` — swap the entire balance of the input token.
 * - `"EXACT_OUTPUT"` — swap to receive an exact amount of the output token (no longer supported by the router).
 **/
export type SwapOperation = "EXACT_INPUT" | "EXACT_INPUT_ALL" | "EXACT_OUTPUT";

/**
 * Result returned from router contract
 */
export interface RouterResult {
  /**
   * Amount received by router after all swaps in the block where the router is called
   * Always denominated in target token
   */
  amount: bigint;
  /**
   * amount * (1 - slippage)
   * Always denominated in target token
   */
  minAmount: bigint;
  /**
   * List of calls swap/unwrap/etc calls to adapters returned by router
   */
  calls: Array<MultiCall>;
}

export interface RouterRewardsResult {
  /**
   * List of calls swap/unwrap/etc calls to adapters returned by router
   */
  calls: Array<MultiCall>;
}

/**
 * Router return list of all balances (including 0 balances) after operation, but it doesn't include original balance
 * - For example you had 5k sUSDS  and 5k DAI as collateral, debt is 20k DAI, router will return 25k sUDS and all other token allowed on CM will be 0n or 1n
 * Since front-end is interested in FULL balances structure, we override target balance in the following way:
 * min = record[sUSDS] = 5k from collateral + 25k of minAmount; avg = record[sUSDS] = 5k from collateral + 25.5k of avgAmount
 * - minAmount
 * - avgAmount
 * - array of calls to execute swap
 */
export interface OpenStrategyResult extends RouterResult {
  /**
   * Balances of opened credit account
   * Leftover balances stay the same
   * All expected balances are converted into target token, which amount is returned in router result
   */
  balances: Record<Address, bigint>;
  /**
   * Same as balances, but for min balance in target token
   * @see RouterResult.minAmount
   */
  minBalances: Record<Address, bigint>;
}

export interface RouterCloseResult extends RouterResult {
  /**
   * When account is closed, the router swaps only tokens different from underlying,
   * we are more interested in TOTAL balance of underlying token after all swaps are done
   * for this reason we sum up underlying token that was on account before swap
   * with underlying token amount received during swap and call it underlyingBalance
   */
  underlyingBalance: bigint;
}

/**
 * Slice of credit manager data required for router operations
 */
export interface RouterCMSlice {
  address: Address;
  creditFacade: Address;
  collateralTokens: Array<Address>;
}

/**
 * Minimal slice of credit-account data required by router operations.
 **/
export type RouterCASlice = Pick<
  CreditAccountData,
  | "tokens"
  | "enabledTokensMask"
  | "underlying"
  | "creditAccount"
  | "creditFacade"
  | "debt"
  | "totalDebtUSD"
  | "creditManager"
>;

export interface FindOneTokenPathProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * Minimal credit manager data on which operation is performed
   */
  creditManager: RouterCMSlice;
  /**
   * Address of input token
   */
  tokenIn: Address;
  /**
   * Address of target token
   */
  tokenOut: Address;
  /**
   * Incoming amount of tokenIn to swap
   */
  amount: bigint;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage: number | bigint;
}

export interface FindOpenStrategyPathProps {
  /**
   * Minimal credit manager data on which operation is performed
   */
  creditManager: RouterCMSlice;
  /**
   * Collateral assets + debt asset, nominated in ther respective tokens.
   * For example, if you open an USDC Credit Account, borrow 50_000 USDC and provide 10 WETH and 10_000 DAI as collateral
   * from your own funds, expectedBalances should be: [{amount: 10*10^wethDecimals}, {amount: 10000*10^daiDecimals}, {amount: 10000*10^usdcDecimals}]
   */
  expectedBalances: Array<Asset>;
  /**
   * Balances to keep on account after opening.
   * For example if don't want to swap WETH in the example above, leftoverBalances should be: [{amount: 10*10^wethDecimals}]
   */
  leftoverBalances: Array<Asset>;
  /**
   * Address of desired token to swap into
   */
  target: Address;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage: number | bigint;
}

export interface FindClaimAllRewardsProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * List of token rewards of which we want to claim and swap to underlying token during closing ca process
   */
  tokensToClaim: Array<Asset>;
}

export interface FindBestClosePathProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * Minimal credit manager data on which operation is performed
   */
  creditManager: RouterCMSlice;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage: bigint | number;
  /**
   * Balances {@link ClosePathBalances} to close account with, if not provided, all assets will be swapped according to inner logic.
   */
  balances?: ClosePathBalances;
  /**
   * List of assets to keep on account after closing.
   * When balances are explicitly provided, keepAssets is ignored.
   */
  keepAssets?: Address[];
  /**
   * Debt only mode - will try to sell just enough of most valuable token to cover debt
   */
  debtOnly?: boolean;
}

export interface ClosePathBalances {
  /**
   * List of all credit account balances nominated in their respective tokens.
   * Current balances or expected balances after some actions (e.g. add/withdraw collateral),
   * if these actions are before router calls — including balances of tokens
   * not yet on the account (e.g. a claim token about to be received), which
   * are absent from `creditAccount.tokens` and must be added here explicitly.
   */
  expectedBalances: Array<Asset>;
  /**
   * List of all credit account balances that shouldn't be swapped nominated in their respective tokens.
   * Will be kept on account after all actions.
   * If the final balance is 0, we set 1 for gas optimization, except for forbidden tokens
   */
  leftoverBalances: Array<Asset>;
  /**
   * List of token rewards of which we want to claim and swap to underlying token during closing ca process
   */
  tokensToClaim?: Array<Asset>;
}

/**
 * On-chain router contract that finds optimal multi-hop swap paths
 * for credit-account operations: single-token swaps, open-strategy
 * collateral conversion, reward claiming, and full account closure.
 *
 * Which finder to use:
 *
 * - {@link findOneTokenPath} — full spend of a single token. The on-chain
 *   `routeOneToOne` reads leftovers from the **live** account balances:
 *   a full spend emits `leftover=1` diff encodings, while pre-existing dust
 *   of intermediate tokens is preserved as leftover.
 * - {@link findOpenStrategyPath} — partial spend: swap a token while keeping
 *   an exact remainder on the account. `expectedBalances` is the total amount
 *   available at execution time (may differ from the live balance, e.g. when
 *   the input token arrives in the same multicall from a delayed-withdrawal
 *   claim), `leftoverBalances` is the amount to keep; the router swaps the
 *   difference.
 * - {@link findBestClosePath} account closure: converts all remaining assets
 *   (including dust) into underlying.
 **/
export interface IRouterContract extends IBaseContract {
  /**
   * Find the best path to swap one token into another.
   * Use for full spends of a single token; to keep an exact remainder
   * on the account, use {@link findOpenStrategyPath} instead.
   *
   * @param props - {@link FindOneTokenPathProps}
   * @returns The optimal swap result including amount, slippage-adjusted
   *   minimum, and the multi-call sequence to execute.
   **/
  findOneTokenPath: (props: FindOneTokenPathProps) => Promise<RouterResult>;

  /**
   * Find the best path for opening a credit account by converting all
   * collateral (except leftovers) into a single target token.
   * Also the right choice for any partial spend that must keep an exact
   * remainder on the account (see {@link IRouterContract}).
   *
   * @param props - {@link FindOpenStrategyPathProps}
   * @returns Swap result with projected post-open balances.
   **/
  findOpenStrategyPath: (
    props: FindOpenStrategyPathProps,
  ) => Promise<OpenStrategyResult>;

  /**
   * Construct calls to claim all pending rewards on a credit account
   * and swap them to the underlying token.
   *
   * @param props - {@link FindClaimAllRewardsProps}
   * @returns Multi-call sequence for claiming and swapping rewards.
   **/
  findClaimAllRewards: (
    props: FindClaimAllRewardsProps,
  ) => Promise<RouterRewardsResult>;

  /**
   * Find the best path to swap all credit-account assets into the
   * underlying token. Used for account closure and liquidation
   *
   * @param props - {@link FindBestClosePathProps}
   * @returns Swap result including the total underlying balance
   *   after all swaps.
   **/
  findBestClosePath: (
    props: FindBestClosePathProps,
  ) => Promise<RouterCloseResult>;
}
