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

export interface SwapTask {
  swapOperation: number;
  creditAccount: Address;
  tokenIn: Address;
  tokenOut: Address;
  connectors: Array<Address>;
  amount: bigint;
  leftoverAmount: bigint;
}

export interface RouterResult {
  amount: bigint;
  minAmount: bigint;
  calls: Array<MultiCall>;
}

export interface OpenStrategyResult extends RouterResult {
  balances: Record<Address, bigint>;
  minBalances: Record<Address, bigint>;
}

export interface RouterCloseResult extends RouterResult {
  underlyingBalance: bigint;
}

export interface CurvePoolStruct {
  curvePool: Address;
  metapoolBase: Address;
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
  creditAccount: RouterCASlice;
  creditManager: RouterCMSlice;
  swapOperation: SwapOperation;
  tokenIn: Address;
  tokenOut: Address;
  amount: bigint;
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
  creditAccount: RouterCASlice;
  creditManager: RouterCMSlice;
  tokenIn: Address;
  tokenOut: Address;
  amount: bigint;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage: number | bigint;
}

export interface FindOpenStrategyPathProps {
  creditManager: RouterCMSlice;
  expectedBalances: Array<Asset>;
  leftoverBalances: Array<Asset>;
  target: Address;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage: number | bigint;
}

export interface FindBestClosePathProps {
  creditAccount: RouterCASlice;
  creditManager: RouterCMSlice;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage: bigint | number;
  balances?: ClosePathBalances;
}

export interface ClosePathBalances {
  /**
   * Current balances or expected balances after some actions (add/withdraw collateral, for example),
   * if these actions are before router calls
   */
  expectedBalances: Array<Asset>;
  /**
   * Balances to keep on account after all actions.
   * If the final balance is 0, we set 1 for gas optimization, except for forbidden tokens
   */
  leftoverBalances: Array<Asset>;
}

export interface IRouterContract extends IBaseContract {
  /**
   * Finds best path to swap all Normal tokens and tokens "on the way" to target one and vice versa
   * @param props
   * @returns
   */
  findOneTokenPath: (props: FindOneTokenPathProps) => Promise<RouterResult>;
  /**
   * @dev Finds the best path for opening Credit Account and converting all NORMAL tokens and LP token in the way to TARGET
   * @param creditManager CreditManagerData which represents credit manager you want to use to open Credit Account
   * @param expectedBalances Expected balances which would be on account accounting also debt. For example,
   *    if you open an USDC Credit Account, borrow 50_000 USDC and provide 10 WETH and 10_USDC as collateral
   *    from your own funds, expectedBalances should be: { "USDC": 60_000 * (10**6), "<address of WETH>": WAD.mul(10) }
   * @param leftoverBalances Balances to keep on account after opening
   * @param target Address of symbol of desired token
   * @param slippage Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @returns PathFinderOpenStrategyResult which
   */
  findOpenStrategyPath: (
    props: FindOpenStrategyPathProps,
  ) => Promise<OpenStrategyResult>;
  /**
   * @dev Finds the path to swap / withdraw all assets from CreditAccount into underlying asset
   *   Can bu used for closing Credit Account and for liquidations as well.
   * @param creditAccount CreditAccountStruct object used for close path computation
   * @param creditManager CreditManagerSlice for corresponding credit manager
   * @param slippage Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @return The best option in PathFinderCloseResult format, which
   *          - underlyingBalance - total balance of underlying token
   *          - calls - list of calls which should be done to swap & unwrap everything to underlying token
   */
  findBestClosePath: (
    props: FindBestClosePathProps,
  ) => Promise<RouterCloseResult>;
  findAllSwaps: (props: FindAllSwapsProps) => Promise<RouterResult[]>;
  /**
   * V3.0 sdk-gov legacy method
   * Should be removed after migration to V3.1
   * @param collateralTokens
   * @returns
   */
  getAvailableConnectors: (collateralTokens: Address[]) => Address[];
  /**
   * V3.0 legacy method
   * Used by batch liquidator
   * @param ca
   * @param cm
   * @returns
   */
  getFindClosePathInput: (
    ca: RouterCASlice,
    cm: RouterCMSlice,
    balances?: Leftovers,
  ) => FindClosePathInput;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RouterHooks = {
  /**
   * Internal router event
   */
  foundPathOptions: [{ creditAccount: Address } & FindClosePathInput];
};
