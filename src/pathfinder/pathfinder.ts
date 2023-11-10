import {
  AwaitedRes,
  NetworkType,
  RAY,
  SupportedToken,
  toBigInt,
  tokenDataByNetwork,
} from "@gearbox-protocol/sdk-gov";
import { providers, Signer } from "ethers";

import { Asset } from "../core/assets";
import { CreditAccountData } from "../core/creditAccount";
import { CreditManagerData } from "../core/creditManager";
import { IRouter, IRouter__factory } from "../types";
import { BalanceStruct } from "../types/interfaces/IRouter";
import {
  PathFinderCloseResult,
  PathFinderOpenStrategyResult,
  PathFinderResult,
  SwapOperation,
  SwapTask,
} from "./core";
import { PathOptionFactory } from "./pathOptions";

const MAX_GAS_PER_ROUTE = 200e6;
const GAS_PER_BLOCK = 400e6;

interface FindAllSwapsProps {
  creditAccount: CreditAccountData;
  swapOperation: SwapOperation;
  tokenIn: string;
  tokenOut: string;
  amount: bigint;
  leftoverAmount: bigint;
  slippage: number;
}

interface FindOneTokenPathProps {
  creditAccount: CreditAccountData;
  tokenIn: string;
  tokenOut: string;
  amount: bigint;
  slippage: number;
}

interface FindBestClosePathProps {
  creditAccount: CreditAccountData;
  creditManager: CreditManagerData;
  expectedBalances: Record<string, Asset>;
  leftoverBalances: Record<string, Asset>;
  slippage: number;
  noConcurrency?: boolean;
}

interface FindOpenStrategyPathProps {
  creditManager: CreditManagerData;
  expectedBalances: Record<string, Asset>;
  leftoverBalances: Record<string, Asset>;
  target: string;
  slippage: number;
}

export class PathFinder {
  pathFinder: IRouter;
  network: NetworkType;

  public static connectors: Array<SupportedToken> = [
    "USDC",
    "WETH",
    "USDT",
    "FRAX",
  ];
  protected readonly _connectors: Array<string>;

  constructor(
    address: string,
    provider: Signer | providers.Provider,
    network: NetworkType = "Mainnet",
    connectors = PathFinder.connectors,
  ) {
    this.pathFinder = IRouter__factory.connect(address, provider);
    this.network = network;

    this._connectors = connectors
      .map(c => tokenDataByNetwork[this.network][c]?.toLowerCase())
      .filter(t => !!t);
  }

  async findAllSwaps({
    creditAccount,
    swapOperation,
    tokenIn,
    tokenOut,
    amount,
    leftoverAmount,
    slippage,
  }: FindAllSwapsProps): Promise<Array<PathFinderResult>> {
    const connectors = this.getAvailableConnectors(creditAccount.balances);

    const swapTask: SwapTask = {
      swapOperation: swapOperation,
      creditAccount: creditAccount.addr,
      tokenIn,
      tokenOut,
      connectors,
      amount,
      leftoverAmount,
    };

    const results = await this.pathFinder.callStatic.findAllSwaps(
      swapTask,
      slippage,
      {
        gasLimit: GAS_PER_BLOCK,
      },
    );

    const unique: Record<string, PathFinderResult> = {};

    results.forEach(r => {
      const key = `${r.minAmount.toHexString()}${r.calls
        .map(c => `${c.target.toLowerCase()}${c.callData}`)
        .join("-")}`;

      unique[key] = {
        amount: toBigInt(r.amount),
        minAmount: toBigInt(r.minAmount),
        gasUsage: toBigInt(r.gasUsage),
        calls: r.calls,
      };
    });

    return Object.values(unique);
  }

  async findOneTokenPath({
    creditAccount,
    tokenIn,
    tokenOut,
    amount,
    slippage,
  }: FindOneTokenPathProps): Promise<PathFinderResult> {
    const connectors = this.getAvailableConnectors(creditAccount.balances);

    const result = await this.pathFinder.callStatic.findOneTokenPath(
      tokenIn,
      amount,
      tokenOut,
      creditAccount.addr,
      connectors,
      slippage,
      {
        gasLimit: GAS_PER_BLOCK,
      },
    );

    return {
      amount: toBigInt(result.amount),
      minAmount: toBigInt(result.minAmount),
      gasUsage: toBigInt(result.gasUsage),
      calls: result.calls,
    };
  }

  /**
   * @dev Finds the best path for opening credit account and converting all NORMAL tokens and LP token in the way to TARGET
   * @param cm CreditManagerData which represents credit manager you want to use to open credit account
   * @param expectedBalances Expected balances which would be on account accounting also debt. For example,
   *    if you open an USDC credit account, borrow 50_000 USDC and provide 10 WETH and 10_USDC as collateral
   *    from your own funds, expectedBalances should be: { "USDC": 60_000 * (10**6), "<address of WETH>": WAD.mul(10) }
   *
   * @param target Address of symbol of desired token
   * @param slippage Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @returns PathFinderOpenStrategyResult which
   */

  async findOpenStrategyPath({
    creditManager: cm,
    expectedBalances,
    leftoverBalances,
    target,
    slippage,
  }: FindOpenStrategyPathProps): Promise<PathFinderOpenStrategyResult> {
    const expected: Array<BalanceStruct> = cm.collateralTokens.map(token => ({
      token,
      balance: expectedBalances[token]?.balance || 0n,
    }));

    const leftover: Array<BalanceStruct> = cm.collateralTokens.map(token => ({
      token,
      balance: leftoverBalances[token]?.balance || 1n,
    }));

    const connectors = this.getAvailableConnectors(cm.supportedTokens);

    const [outBalances, result] =
      await this.pathFinder.callStatic.findOpenStrategyPath(
        cm.address,
        expected,
        leftover,
        target,
        connectors,
        slippage,
        {
          gasLimit: GAS_PER_BLOCK,
        },
      );

    const balancesAfter = outBalances.reduce<Record<string, bigint>>(
      (acc, b) => {
        acc[b.token.toLowerCase()] = toBigInt(b.balance);
        return acc;
      },
      {},
    );

    return {
      balances: { ...balancesAfter, [target]: toBigInt(result.amount) },
      minBalances: { ...balancesAfter, [target]: toBigInt(result.minAmount) },
      calls: result.calls,
      minAmount: toBigInt(result.minAmount),
      amount: toBigInt(result.amount),
      gasUsage: toBigInt(result.gasUsage),
    };
  }

  /**
   * @dev Finds the path to swap / withdraw all assets from CreditAccount into underlying asset
   *   Can bu used for closing credit account and for liquidations as well.
   * @param creditAccount CreditAccountData object used for close path computation
   * @param slippage Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @return The best option in PathFinderCloseResult format, which
   *          - underlyingBalance - total balance of underlying token
   *          - calls - list of calls which should be done to swap & unwrap everything to underlying token
   */
  async findBestClosePath({
    creditAccount,
    creditManager: cm,
    expectedBalances,
    leftoverBalances,
    slippage,
    noConcurrency = false,
  }: FindBestClosePathProps): Promise<PathFinderCloseResult> {
    const loopsPerTx = Math.floor(GAS_PER_BLOCK / MAX_GAS_PER_ROUTE);
    const pathOptions = PathOptionFactory.generatePathOptions(
      creditAccount.allBalances,
      loopsPerTx,
    );

    const expected: Array<BalanceStruct> = cm.collateralTokens.map(token => ({
      token,
      balance: expectedBalances[token]?.balance || 0n,
    }));

    const leftover: Array<BalanceStruct> = cm.collateralTokens.map(token => ({
      token,
      balance: leftoverBalances[token]?.balance || 1n,
    }));

    const connectors = this.getAvailableConnectors(creditAccount.balances);

    let results: Array<AwaitedRes<IRouter["callStatic"]["findBestClosePath"]>> =
      [];
    if (noConcurrency) {
      for (const po of pathOptions) {
        results.push(
          await this.pathFinder.callStatic.findBestClosePath(
            creditAccount.addr,
            expected,
            leftover,
            connectors,
            slippage,
            po,
            loopsPerTx,
            false,
            {
              gasLimit: GAS_PER_BLOCK,
            },
          ),
        );
      }
    } else {
      const requests = pathOptions.map(po =>
        this.pathFinder.callStatic.findBestClosePath(
          creditAccount.addr,
          expected,
          leftover,
          connectors,
          slippage,
          po,
          loopsPerTx,
          false,
          {
            gasLimit: GAS_PER_BLOCK,
          },
        ),
      );
      results = await Promise.all(requests);
    }

    const bestResult = results.reduce<PathFinderResult>(
      (best, [pathFinderResult, gasPriceRAY]) =>
        PathFinder.compare(
          best,
          {
            calls: pathFinderResult.calls,
            amount: toBigInt(pathFinderResult.amount),
            minAmount: toBigInt(pathFinderResult.minAmount),
            gasUsage: toBigInt(pathFinderResult.gasUsage),
          },
          toBigInt(gasPriceRAY),
        ),
      {
        amount: 0n,
        minAmount: 0n,
        gasUsage: 0n,
        calls: [],
      },
    );

    return {
      ...bestResult,
      underlyingBalance:
        bestResult.minAmount +
        creditAccount.allBalances[creditAccount.underlyingToken.toLowerCase()]
          .balance,
    };
  }

  static compare(
    r1: PathFinderResult,
    r2: PathFinderResult,
    gasPriceRAY: bigint,
  ): PathFinderResult {
    const comparator = (
      { minAmount, gasUsage }: PathFinderResult,
      gasPrice: bigint,
    ) => minAmount - (gasUsage * gasPrice) / RAY;
    return comparator(r1, gasPriceRAY) > comparator(r2, gasPriceRAY) ? r1 : r2;
  }

  getAvailableConnectors(
    availableList: Record<string, bigint> | Record<string, true>,
  ) {
    return PathFinder.getAvailableConnectors(availableList, this._connectors);
  }

  static getAvailableConnectors(
    availableList: Record<string, bigint> | Record<string, true>,
    connectors: string[],
  ) {
    return connectors.filter(t => availableList[t] !== undefined);
  }
}
