import { getConnectors, NetworkType } from "@gearbox-protocol/sdk-gov";
import {
  Address,
  getContract,
  GetContractReturnType,
  PublicClient,
} from "viem";

import { Asset } from "../core/assets";
import { CreditAccountData } from "../core/creditAccount";
import { CreditManagerData } from "../core/creditManager";
import { iRouterV3Abi } from "../types";
import {
  MultiCall,
  PathFinderCloseResult,
  PathFinderOpenStrategyResult,
  PathFinderResult,
  SwapOperation,
  SwapTask,
} from "./core";
import { PathOptionFactory } from "./pathOptions";

const MAX_GAS_PER_ROUTE = 200000000n;
const GAS_PER_BLOCK = 400000000n;

interface FindAllSwapsProps {
  creditAccount: CreditAccountData;
  swapOperation: SwapOperation;
  tokenIn: Address;
  tokenOut: Address;
  amount: bigint;
  leftoverAmount: bigint;
  slippage: number;
}

interface FindOneTokenPathProps {
  creditAccount: CreditAccountData;
  tokenIn: Address;
  tokenOut: Address;
  amount: bigint;
  slippage: number;
}

interface FindBestClosePathProps {
  creditAccount: CreditAccountData;
  creditManager: CreditManagerData;
  expectedBalances: Record<string, Asset>;
  leftoverBalances: Record<string, Asset>;
  slippage: number;
  network: NetworkType;
}

interface FindOpenStrategyPathProps {
  creditManager: CreditManagerData;
  expectedBalances: Record<string, Asset>;
  leftoverBalances: Record<string, Asset>;
  target: Address;
  slippage: number;
}

interface Balance {
  token: Address;
  balance: bigint;
}

export class PathFinder {
  pathFinder: GetContractReturnType<typeof iRouterV3Abi, PublicClient>;
  network: NetworkType;

  protected readonly _connectors: Array<Address>;

  constructor(
    address: Address,
    provider: PublicClient,
    network: NetworkType = "Mainnet",
  ) {
    this.pathFinder = getContract({
      address,
      abi: iRouterV3Abi,
      client: provider,
    });
    this.network = network;

    this._connectors = getConnectors(network);
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

    const { result: results } = await this.pathFinder.simulate.findAllSwaps(
      [swapTask, BigInt(slippage)],
      {
        gas: GAS_PER_BLOCK,
      },
    );

    const unique: Record<string, PathFinderResult> = {};

    results.forEach(r => {
      const key = `${r.minAmount.toString()}${r.calls
        .map(c => `${c.target.toLowerCase()}${c.callData}`)
        .join("-")}`;

      unique[key] = {
        amount: r.amount,
        minAmount: r.minAmount,
        calls: r.calls as Array<MultiCall>,
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

    const { result } = await this.pathFinder.simulate.findOneTokenPath(
      [
        tokenIn,
        amount,
        tokenOut,
        creditAccount.addr,
        connectors,
        BigInt(slippage),
      ],
      {
        gas: GAS_PER_BLOCK,
      },
    );

    return {
      amount: result.amount,
      minAmount: result.minAmount,
      calls: result.calls as Array<MultiCall>,
    };
  }

  /**
   * @dev Finds the best path for opening Credit Account and converting all NORMAL tokens and LP token in the way to TARGET
   * @param cm CreditManagerData which represents credit manager you want to use to open Credit Account
   * @param expectedBalances Expected balances which would be on account accounting also debt. For example,
   *    if you open an USDC Credit Account, borrow 50_000 USDC and provide 10 WETH and 10_USDC as collateral
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
    target: targetUntyped,
    slippage,
  }: FindOpenStrategyPathProps): Promise<PathFinderOpenStrategyResult> {
    const target = targetUntyped as Address;

    const input: Array<Balance> = cm.collateralTokens.map(token => ({
      token,
      balance: expectedBalances[token]?.balance || 0n,
    }));

    const leftover: Array<Balance> = cm.collateralTokens.map(token => ({
      token,
      balance: leftoverBalances[token]?.balance || 1n,
    }));

    const connectors = this.getAvailableConnectors(cm.supportedTokens);

    const {
      result: [outBalances, result],
    } = await this.pathFinder.simulate.findOpenStrategyPath(
      [cm.address, input, leftover, target, connectors, BigInt(slippage)],
      {
        gas: GAS_PER_BLOCK,
      },
    );

    const balancesAfter = outBalances.reduce<Record<Address, bigint>>(
      (acc, b) => {
        acc[b.token.toLowerCase() as Address] = b.balance;
        return acc;
      },
      {},
    );

    return {
      balances: {
        ...balancesAfter,
        [target]: (expectedBalances[target]?.balance || 0n) + result.amount,
      },
      minBalances: {
        ...balancesAfter,
        [target]: (expectedBalances[target]?.balance || 0n) + result.minAmount,
      },
      calls: result.calls as Array<MultiCall>,
      minAmount: result.minAmount,
      amount: result.amount,
    };
  }

  /**
   * @dev Finds the path to swap / withdraw all assets from CreditAccount into underlying asset
   *   Can bu used for closing Credit Account and for liquidations as well.
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
    network,
  }: FindBestClosePathProps): Promise<PathFinderCloseResult> {
    const loopsPerTx = GAS_PER_BLOCK / MAX_GAS_PER_ROUTE;
    const pathOptions = PathOptionFactory.generatePathOptions(
      creditAccount.allBalances,
      Number(loopsPerTx),
      network,
    );

    const expected: Array<Balance> = cm.collateralTokens.map(token => {
      // When we pass expected balances explicitly, we need to mimic router behaviour by filtering out leftover tokens
      // for example, we can have stETH balance of 2, because 1 transforms to 2 because of rebasing
      // https://github.com/Gearbox-protocol/router-v3/blob/c230a3aa568bb432e50463cfddc877fec8940cf5/contracts/RouterV3.sol#L222
      const actual = expectedBalances[token]?.balance || 0n;
      return {
        token,
        balance: actual > 10n ? actual : 0n,
      };
    });

    const leftover: Array<Balance> = cm.collateralTokens.map(token => ({
      token,
      balance: leftoverBalances[token]?.balance || 1n,
    }));

    const connectors = this.getAvailableConnectors(creditAccount.balances);

    const results = await Promise.all(
      pathOptions.map(po =>
        this.pathFinder.simulate.findBestClosePath(
          [
            creditAccount.addr,
            expected,
            leftover,
            connectors,
            BigInt(slippage),
            po,
            loopsPerTx,
            false,
          ],
          {
            gas: GAS_PER_BLOCK,
          },
        ),
      ),
    );

    const bestResult = results.reduce<PathFinderResult>(
      (best, pathFinderResult) =>
        PathFinder.compare(best, {
          calls: pathFinderResult.result.calls as Array<MultiCall>,
          amount: pathFinderResult.result.amount,
          minAmount: pathFinderResult.result.minAmount,
        }),
      {
        amount: 0n,
        minAmount: 0n,
        calls: [],
      },
    );

    return {
      ...bestResult,
      underlyingBalance:
        bestResult.minAmount +
        creditAccount.allBalances[
          creditAccount.underlyingToken.toLowerCase() as Address
        ].balance,
    };
  }

  static compare(r1: PathFinderResult, r2: PathFinderResult): PathFinderResult {
    return r1.amount > r2.amount ? r1 : r2;
  }

  getAvailableConnectors(
    availableList: Record<string, bigint> | Record<string, true>,
  ) {
    const connectors = PathFinder.getAvailableConnectors(
      availableList,
      this._connectors,
    );
    return connectors;
  }

  static getAvailableConnectors(
    availableList: Record<string, bigint> | Record<string, true>,
    connectors: Address[],
  ) {
    return connectors.filter(t => availableList[t] !== undefined);
  }
}
