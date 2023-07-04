import { BigNumberish, providers, Signer } from "ethers";

import { NetworkType } from "../core/chains";
import { RAY } from "../core/constants";
import { CreditAccountData } from "../core/creditAccount";
import { CreditManagerData } from "../core/creditManager";
import { SupportedToken, tokenDataByNetwork } from "../tokens/token";
import { IRouter__factory } from "../types";
import { BalanceStruct } from "../types/@gearbox-protocol/router/contracts/interfaces/IClosePathResolver";
import {
  IRouter,
  SwapTaskStruct,
} from "../types/@gearbox-protocol/router/contracts/interfaces/IRouter";
import { toBigInt } from "../utils/formatter";
import { AwaitedRes } from "../utils/types";
import {
  MultiCall,
  PathFinderCloseResult,
  PathFinderOpenStrategyResult,
  PathFinderResult,
  SwapOperation,
} from "./core";
import { PathOptionFactory } from "./pathOptions";

const MAX_GAS_PER_ROUTE = 200e6;
const GAS_PER_BLOCK = 400e6;

export interface CloseResult {
  amount: bigint;
  calls: Array<MultiCall>;
  gasUsage: bigint;
}

export class PathFinder {
  pathFinder: IRouter;
  network: NetworkType;

  public static connectors: Array<SupportedToken> = ["USDC", "WETH", "DAI"];
  protected readonly _connectors: Array<string>;

  constructor(
    address: string,
    provider: Signer | providers.Provider,
    network: NetworkType = "Mainnet",
    connectors?: Array<SupportedToken>,
  ) {
    this.pathFinder = IRouter__factory.connect(address, provider);
    this.network = network;
    this._connectors = (connectors || PathFinder.connectors).map(
      c => tokenDataByNetwork[this.network][c as SupportedToken],
    );
  }

  async findAllSwaps(
    creditAccount: CreditAccountData,
    swapOperation: SwapOperation,
    tokenIn: SupportedToken | string,
    tokenOut: SupportedToken | string,
    amount: BigNumberish,
    slippage: number,
  ): Promise<Array<PathFinderResult>> {
    const swapTask: SwapTaskStruct = {
      swapOperation: swapOperation,
      creditAccount: creditAccount.addr,
      tokenIn:
        tokenDataByNetwork[this.network][tokenIn as SupportedToken] || tokenIn,
      tokenOut:
        tokenDataByNetwork[this.network][tokenOut as SupportedToken] ||
        tokenOut,
      connectors: this._connectors,
      amount: amount,
      slippage,
      externalSlippage: false,
    };

    const results = await this.pathFinder.callStatic.findAllSwaps(swapTask, {
      gasLimit: GAS_PER_BLOCK,
    });

    const unique: Record<string, PathFinderResult> = {};

    results.forEach(r => {
      const key = `${r.amount.toHexString()}${r.calls
        .map(c => `${c.target.toLowerCase()}${c.callData}`)
        .join("-")}`;

      unique[key] = {
        amount: toBigInt(r.amount),
        calls: r.calls,
      };
    });

    return Object.values(unique);
  }

  async findOneTokenPath(
    creditAccount: CreditAccountData,
    tokenIn: SupportedToken | string,
    tokenOut: SupportedToken | string,
    amount: BigNumberish,
    slippage: number,
  ): Promise<PathFinderResult> {
    const tokenInAddr =
      tokenDataByNetwork[this.network][tokenIn as SupportedToken] || tokenIn;

    // if (creditAccount.balances[tokenInAddr.toLowerCase()].lt(amount)) {
    //   throw new Error(`Not enough balance for token ${tokenIn}`);
    // }
    const result = await this.pathFinder.callStatic.findOneTokenPath(
      tokenInAddr,
      amount,
      tokenDataByNetwork[this.network][tokenOut as SupportedToken] || tokenOut,
      creditAccount.addr,
      this._connectors,
      slippage,
      {
        gasLimit: GAS_PER_BLOCK,
      },
    );

    return {
      amount: toBigInt(result.amount),
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

  async findOpenStrategyPath(
    cm: CreditManagerData,
    expectedBalances: Record<SupportedToken | string, BigNumberish>,
    target: SupportedToken | string,
    slippage: number,
  ): Promise<PathFinderOpenStrategyResult> {
    const targetAddr =
      tokenDataByNetwork[this.network][target as SupportedToken] || target;

    const expectedBalancesAddr = Object.entries(expectedBalances).reduce<
      Record<string, BigNumberish>
    >((acc, [token, balance]) => {
      const tokenAddr =
        tokenDataByNetwork[this.network][token as SupportedToken] || token;
      acc[tokenAddr.toLowerCase()] = balance;
      return acc;
    }, {});

    const balances: Array<BalanceStruct> = cm.collateralTokens.map(token => ({
      token,
      balance: expectedBalancesAddr[token] || 0,
    }));

    const result = await this.pathFinder.callStatic.findOpenStrategyPath(
      cm.address,
      balances,
      targetAddr,
      this._connectors,
      slippage,
      {
        gasLimit: GAS_PER_BLOCK,
      },
    );

    const balancesAfter = result[0].reduce<Record<string, bigint>>((acc, b) => {
      acc[b.token.toLowerCase()] = toBigInt(b.balance);
      return acc;
    }, {});

    return {
      balances: balancesAfter,
      calls: result[1].calls,
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
  async findBestClosePath(
    creditAccount: CreditAccountData,
    slippage: number,
    noConcurency = false,
  ): Promise<PathFinderCloseResult> {
    const loopsPerTx = Math.floor(GAS_PER_BLOCK / MAX_GAS_PER_ROUTE);
    const pathOptions = PathOptionFactory.generatePathOptions(
      creditAccount.allBalances,
      loopsPerTx,
    );

    let results: Array<AwaitedRes<IRouter["callStatic"]["findBestClosePath"]>> =
      [];
    if (noConcurency) {
      for (const po of pathOptions) {
        results.push(
          await this.pathFinder.callStatic.findBestClosePath(
            creditAccount.addr,
            this._connectors,
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
          this._connectors,
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

    const bestResult = results.reduce<CloseResult>(
      (best, [pathFinderResult, gasPriceRAY]) =>
        PathFinder.compare(
          best,
          {
            calls: pathFinderResult.calls,
            amount: toBigInt(pathFinderResult.amount),
            gasUsage: toBigInt(pathFinderResult.gasUsage),
          },
          toBigInt(gasPriceRAY),
        ),
      {
        amount: 0n,
        gasUsage: 0n,
        calls: [],
      },
    );

    return {
      underlyingBalance:
        bestResult.amount +
        creditAccount.allBalances[creditAccount.underlyingToken.toLowerCase()],
      calls: bestResult.calls,
    };
  }

  static compare(
    r1: CloseResult,
    r2: CloseResult,
    gasPriceRAY: bigint,
  ): CloseResult {
    const comparator = ({ amount, gasUsage }: CloseResult, gasPrice: bigint) =>
      amount - (gasUsage * gasPrice) / RAY;
    return comparator(r1, gasPriceRAY) > comparator(r2, gasPriceRAY) ? r1 : r2;
  }
}
