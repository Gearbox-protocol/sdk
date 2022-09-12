import { Provider } from "@ethersproject/abstract-provider";
import { BigNumber, BigNumberish, Signer } from "ethers";

import { NetworkType, RAY } from "../core/constants";
import { CreditAccountData } from "../core/creditAccount";
import { CreditManagerData } from "../core/creditManager";
import { SupportedToken, tokenDataByNetwork } from "../tokens/token";
import { IPathFinder, IPathFinder__factory } from "../types";
import { BalanceStruct } from "../types/contracts/pathfinder/interfaces/IPathFinder";
import { SwapTaskStruct } from "../types/contracts/pathfinder/interfaces/ISwapper";
import {
  PathFinderOpenStrategyResult,
  PathFinderResult,
  SwapOperation,
} from "./core";
import { PathOptionFactory } from "./pathOptions";

const MAX_GAS_PER_ROUTE = 14e6;
const GAS_PER_BLOCK = 30e6;

export interface CloseResult {
  amount: BigNumberish;
  gasUsage: BigNumberish;
}

export class PathFinder {
  pathFinder: IPathFinder;
  network: NetworkType;

  public static connectors: Array<SupportedToken> = ["USDC", "WETH", "DAI"];
  protected readonly _connectors: Array<string>;

  constructor(
    address: string,
    provider: Signer | Provider,
    network: NetworkType = "Mainnet",
    connectors?: Array<SupportedToken>,
  ) {
    this.pathFinder = IPathFinder__factory.connect(address, provider);
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

    const results = await this.pathFinder.callStatic.findAllSwaps(swapTask);
    return results.map(r => ({
      amount: BigNumber.from(r.amount),
      gasUsage: r.gasUsage.toNumber(),
      calls: r.calls,
    }));
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

    if (creditAccount.balances[tokenInAddr.toLowerCase()].lt(amount)) {
      throw new Error(`Not enough balance for token ${tokenIn}`);
    }
    const result = await this.pathFinder.callStatic.findOneTokenPath(
      tokenInAddr,
      amount,
      tokenDataByNetwork[this.network][tokenOut as SupportedToken] || tokenOut,
      creditAccount.addr,
      this._connectors,
      slippage,
    );

    return {
      amount: BigNumber.from(result.amount),
      calls: result.calls,
    };
  }

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
    );

    const balancesAfter = result[0].reduce<Record<string, BigNumber>>(
      (acc, b) => {
        acc[b.token.toLowerCase()] = BigNumber.from(b.balance);
        return acc;
      },
      {},
    );

    return {
      balances: balancesAfter,
      calls: result[1].calls,
    };
  }

  async findBestClosePath(
    creditAccount: CreditAccountData,
    slippage: number,
  ): Promise<BigNumber> {
    const loopsPerTx = GAS_PER_BLOCK / MAX_GAS_PER_ROUTE;
    const pathOptions = PathOptionFactory.generatePathOptions(
      creditAccount.allBalances,
      loopsPerTx,
    );

    const requests = pathOptions.map(po =>
      this.pathFinder.callStatic.findBestClosePath(
        creditAccount.addr,
        this._connectors,
        slippage,
        po,
        loopsPerTx,
        false,
      ),
    );

    const results = await Promise.all(requests);

    const bestResult = results.reduce<CloseResult>(
      (best, [pathFinderResult, gasPriceRAY]) =>
        PathFinder.compare(
          best,
          { amount: pathFinderResult, gasUsage: gasPriceRAY },
          gasPriceRAY,
        ),
      {
        amount: BigNumber.from(0),
        gasUsage: 0,
      },
    );

    return BigNumber.from(bestResult.amount);
  }

  static compare(
    r1: CloseResult,
    r2: CloseResult,
    gasPriceRAY: BigNumberish,
  ): CloseResult {
    const comparator = (
      { amount, gasUsage }: CloseResult,
      gasPrice: BigNumberish,
    ) =>
      BigNumber.from(amount).sub(
        BigNumber.from(gasUsage).mul(gasPrice).div(RAY),
      );

    return comparator(r1, gasPriceRAY).gt(comparator(r2, gasPriceRAY))
      ? r1
      : r2;
  }
}
