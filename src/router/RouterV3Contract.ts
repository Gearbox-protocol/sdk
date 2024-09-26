import type { Address } from "@gearbox-protocol/sdk-gov";
import { getConnectors } from "@gearbox-protocol/sdk-gov";

import type { MultiCall } from "../../core/transactions";
import { routerV3Abi } from "../../router";
import { BaseContract } from "../base/BaseContract";
import type { TokenBalance } from "./pathOptions";
import { PathOptionFactory } from "./pathOptions";
import type { RouterFactory } from "./RouterFactory";
import type {
  PathFinderCloseResult,
  PathFinderOpenStrategyResult,
  PathFinderResult,
  RouterResult,
  SwapOperation,
} from "./types";

const MAX_GAS_PER_ROUTE = BigInt(200e6);
const GAS_PER_BLOCK = BigInt(400e6);

export interface BalanceStruct {
  token: Address;
  balance: bigint;
}

type abi = typeof routerV3Abi;

export class RouterV3Contract extends BaseContract<abi> {
  factory: RouterFactory;
  protected readonly connectors: Array<Address>;

  public static async attach(
    address: Address,
    factory: RouterFactory,
  ): Promise<RouterV3Contract> {
    const contact = new RouterV3Contract({
      factory,
      address,
    });

    return contact;
  }

  protected constructor(args: { factory: RouterFactory; address: Address }) {
    super({
      ...args,
      name: "RouterV3",
      abi: routerV3Abi,
      chainClient: args.factory.sdk.v3,
    });

    this.factory = args.factory;

    this.connectors = getConnectors(args.factory.v3.networkType);
  }

  // USER FUNCTIONS
  async findAllSwaps(
    creditAccount: Address,
    collateralTokens: Array<Address>,
    swapOperation: SwapOperation,
    tokenIn: Address,
    tokenOut: Address,
    amount: bigint,
    leftoverAmount: bigint,
    slippage: number,
  ): Promise<Array<PathFinderResult>> {
    const connectors = this.getAvailableConnectors(collateralTokens);

    const swapTask = {
      swapOperation: swapOperation,
      creditAccount,
      tokenIn,
      tokenOut,
      connectors,
      amount,
      leftoverAmount,
    };

    const { result } = await this.contract.simulate.findAllSwaps(
      [swapTask, BigInt(slippage)],
      {
        gas: GAS_PER_BLOCK,
      },
    );

    const unique: Record<string, PathFinderResult> = {};

    result.forEach(r => {
      const key = `${r.minAmount.toString()}${r.calls
        .map(c => `${c.target.toLowerCase()}${c.callData}`)
        .join("-")}`;

      unique[key] = {
        amount: r.amount,
        minAmount: r.minAmount,
        calls: [...r.calls],
      };
    });

    return Object.values(unique);
  }

  async findOneTokenPath(
    creditAccount: Address,
    collateralTokens: Array<Address>,
    tokenIn: Address,
    tokenOut: Address,
    amount: bigint,
    slippage: number,
  ): Promise<PathFinderResult> {
    const connectors = this.getAvailableConnectors(collateralTokens);

    const { result } = await this.contract.simulate.findOneTokenPath(
      [tokenIn, amount, tokenOut, creditAccount, connectors, BigInt(slippage)],
      {
        gas: GAS_PER_BLOCK,
      },
    );

    return {
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
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

  async findOpenStrategyPath(
    creditManager: Address,
    collateralTokens: Array<Address>,
    expectedBalances: Record<Address, bigint>,
    leftoverBalances: Record<Address, bigint>,
    target: Address,
    slippage: number,
  ): Promise<PathFinderOpenStrategyResult> {
    const input: Array<BalanceStruct> = collateralTokens.map(token => ({
      token,
      balance: expectedBalances[token] || 0n,
    }));

    const leftover: Array<BalanceStruct> = collateralTokens.map(token => ({
      token,
      balance: leftoverBalances[token] || 1n,
    }));

    const connectors = this.getAvailableConnectors(collateralTokens);

    const {
      result: [outBalances, result],
    } = await this.contract.simulate.findOpenStrategyPath(
      [creditManager, input, leftover, target, connectors, BigInt(slippage)],
      {
        gas: GAS_PER_BLOCK,
      },
    );

    const balancesAfter = Object.fromEntries(
      outBalances.map(b => [b.token.toLowerCase(), b.balance]),
    );

    return {
      balances: {
        ...balancesAfter,
        [target]: (expectedBalances[target] || 0n) + result.amount,
      },
      minBalances: {
        ...balancesAfter,
        [target]: (expectedBalances[target] || 0n) + result.minAmount,
      },
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
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
  async findBestClosePath(
    creditAccount: Address,
    collateralTokens: Array<Address>,
    underlying: Address,
    expectedBalances: Record<Address, bigint>,
    leftoverBalances: Record<Address, bigint>,
    slippage: number,
  ): Promise<PathFinderCloseResult> {
    const expected: Array<TokenBalance> = collateralTokens.map(token => {
      // When we pass expected balances explicitly, we need to mimic router behaviour by filtering out leftover tokens
      // for example, we can have stETH balance of 2, because 1 transforms to 2 because of rebasing
      // https://github.com/Gearbox-protocol/router-v3/blob/c230a3aa568bb432e50463cfddc877fec8940cf5/contracts/RouterV3.sol#L222
      const actual = expectedBalances[token] || 0n;
      return {
        token,
        balance: actual > 10n ? actual : 0n,
      };
    });

    const loopsPerTx = GAS_PER_BLOCK / MAX_GAS_PER_ROUTE;
    const pathOptions = PathOptionFactory.generatePathOptions(
      expected,
      this.factory.v3.networkType,
      Number(loopsPerTx),
    );

    const leftover: Array<TokenBalance> = collateralTokens.map(token => ({
      token,
      balance: leftoverBalances[token] || 1n,
    }));

    const connectors = this.getAvailableConnectors(collateralTokens);

    const requests = pathOptions.map(po =>
      this.contract.simulate.findBestClosePath(
        [
          creditAccount,
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
    );
    const results = (await Promise.all(requests)).map(r => ({
      calls: r.result.calls.map(c => ({
        target: c.target as Address,
        callData: c.callData,
      })) as Array<MultiCall>,
      amount: r.result.amount,
      minAmount: r.result.minAmount,
    }));

    const bestResult = results.reduce<RouterResult>(
      (best, pathFinderResult) => this.compare(best, pathFinderResult),
      {
        amount: 0n,
        minAmount: 0n,
        calls: [],
      },
    );

    return {
      ...bestResult,
      underlyingBalance:
        BigInt(bestResult.minAmount) + (expectedBalances[underlying] || 0n),
    };
  }

  compare(r1: RouterResult, r2: RouterResult): RouterResult {
    return r1.amount > r2.amount ? r1 : r2;
  }

  getAvailableConnectors(collateralTokens: Array<Address>) {
    return collateralTokens.filter(t =>
      this.connectors.includes(t.toLowerCase() as Address),
    );
  }
}
