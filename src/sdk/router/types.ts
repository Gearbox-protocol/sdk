import type { Address } from "viem";

import type { IBaseContract } from "../base/BaseContract.js";
import type { CreditAccountData } from "../base/types.js";
import type { MultiCall } from "../types/index.js";
import type { Leftovers } from "./AbstractRouterContract.js";

export type SwapOperation = "EXACT_INPUT" | "EXACT_INPUT_ALL" | "EXACT_OUTPUT";

export interface PathOption {
  target: Address;
  option: number;
  totalOptions: number;
}

export type PathOptionSerie = Array<PathOption>;

/**
 * Result returned from router contract (both v3.0 and v3.1)
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
   * This is returned from router contract v3.0, but is calculated here in js in router v3.1
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

export interface Asset {
  token: Address;
  balance: bigint;
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
 * Slice of credit account data required for router operations
 */
export type RouterCASlice = Pick<
  CreditAccountData,
  | "tokens"
  | "enabledTokensMask"
  | "underlying"
  | "creditAccount"
  | "creditFacade"
  | "debt"
  | "creditManager"
>;

export interface FindAllSwapsProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * Minimal credit manager data on which operation is performed
   */
  creditManager: RouterCMSlice;
  /**
   * {@link SwapOperation} = "EXACT_INPUT" | "EXACT_INPUT_ALL" | "EXACT_OUTPUT"; however router stopped to support EXACT_OUTPUT
   */
  swapOperation: SwapOperation;
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
   * Amount that should be left on account after swap; technically equals to 0 in the most of the cases
   */
  leftoverAmount: bigint;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage: number | bigint;
}

export interface FindClosePathInput {
  pathOptions: Array<PathOptionSerie>;
  expected: Array<Asset>;
  leftover: Array<Asset>;
  connectors: Array<Address>;
}

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
   * Adddress of target token
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
   * Legacy property - array of MultiCall from getRewards
   */
  calls: Array<MultiCall>;
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
   * TODO: legacy v3 option to pass to contract
   */
  force?: boolean;
}

export interface ClosePathBalances {
  /**
   * List of all credit account balances nominated in their respective tokens.
   * Current balances or expected balances after some actions (add/withdraw collateral, for example),
   * if these actions are before router calls
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

export interface IRouterContract extends IBaseContract {
  /**
   * Find the best path to swap token A to token B (target token).
   * @param props - {@link FindOneTokenPathProps}
   * @return result - {@link RouterResult}
   */
  findOneTokenPath: (props: FindOneTokenPathProps) => Promise<RouterResult>;
  /**
   * Finds the best path for opening Credit Account; converts all expectedBalances besides leftoverBalances into target token
   * @param props - {@link FindOpenStrategyPathProps}
   * @returns result - {@link OpenStrategyResult}
   */
  findOpenStrategyPath: (
    props: FindOpenStrategyPathProps,
  ) => Promise<OpenStrategyResult>;

  /**
   * In V3.1 - Constructs calls to claim all rewards for Credit Account. In V3.0 - returns input calls
   * @param props - {@link FindClaimAllRewardsProps}
   * @returns result - {@link RouterRewardsResult}
   */
  findClaimAllRewards: (
    props: FindClaimAllRewardsProps,
  ) => Promise<RouterRewardsResult>;

  /**
   * Finds the path to swap / withdraw all assets from CreditAccount into underlying asset
   * Can be used for closing Credit Account and for liquidations as well.
   * @param props - {@link FindBestClosePathProps}
   * @return result - {@link RouterCloseResult}
   */
  findBestClosePath: (
    props: FindBestClosePathProps,
  ) => Promise<RouterCloseResult>;
  /**
   * Finds all available swaps for given tokens; technically should be avoided to use, since doesn't have any advantage over findOneTokenPath.
   * Deduplicates results by minAmount + stringified call path and returns only unique ones.
   *
   * @deprecated v3.0 legacy method
   *
   * @param props - {@link FindAllSwapsProps}
   * @returns array of {@link RouterResult}
   */
  findAllSwaps: (props: FindAllSwapsProps) => Promise<RouterResult[]>;
  /**
   * Returns list of tokens which can be used as a token to align path through,
   * for ex. when swapping sUSDe it is good to check swaps through USDe.
   *
   * @deprecated V3.0 sdk-gov legacy method
   *
   * @param collateralTokens
   * @returns
   */
  getAvailableConnectors: (collateralTokens: Address[]) => Address[];
  /**
   * Finds input to be used with findBestClosePath
   * Used by batch liquidator.
   *
   * Params are same as in findBestClosePath, just different shape
   *
   * @deprecated V3.0 legacy method
   *
   * @param ca
   * @param cm
   * @param balances
   * @returns
   */
  getFindClosePathInput: (
    ca: RouterCASlice,
    cm: RouterCMSlice,
    balances?: Leftovers,
  ) => FindClosePathInput;
}

export type RouterHooks = {
  /**
   * Internal router event
   * @deprecated v3.0 legacy event
   */
  foundPathOptions: [{ creditAccount: Address } & FindClosePathInput];
};
