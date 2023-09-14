import {
  contractParams,
  ConvexLPToken,
  convexTokens,
  CurveLPToken,
  CurveParams,
  curveTokens,
  NetworkType,
  tokenDataByNetwork,
  tokenSymbolByAddress,
  YearnLPToken,
  yearnTokens,
} from "@gearbox-protocol/sdk-gov";

import { CaTokenBalance } from "../payload/creditAccount";
import { toBigInt } from "../utils/formatter";

export interface PathOption {
  target: string;
  option: number;
  totalOptions: number;
}

export type PathOptionSerie = Array<PathOption>;

export type BalanceInterface = Pick<CaTokenBalance, "balance">;

export class PathOptionFactory {
  static generatePathOptions(
    balances: Record<string, BalanceInterface>,
    loopsInTx: number,
  ): Array<PathOptionSerie> {
    const curvePools: Array<CurveLPToken> =
      PathOptionFactory.getCurvePools(balances);

    const network = PathOptionFactory.detectNetwork(Object.keys(balances)[0]);

    const initPO: PathOptionSerie = curvePools.map(symbol => {
      return {
        target: tokenDataByNetwork[network][symbol],
        option: 0,
        totalOptions: (contractParams[curveTokens[symbol].pool] as CurveParams)
          .tokens.length,
      };
    });

    const totalLoops = initPO.reduce<number>(
      (acc, item) => acc * item.totalOptions,
      1,
    );

    const result: Array<PathOptionSerie> = [];

    let currentPo = [...initPO];

    for (let i = 0; i < totalLoops; i++) {
      if (i % loopsInTx === 0) {
        result.push(currentPo);
      }
      if (i < totalLoops - 1) {
        currentPo = PathOptionFactory.next(currentPo);
      }
    }

    return result;
  }

  static getCurvePools(
    balances: Record<string, BalanceInterface>,
  ): Array<CurveLPToken> {
    const curveSymbols = Object.keys(curveTokens);

    const curvePools: Array<CurveLPToken> = Object.entries(balances)
      .filter(([, balance]) => toBigInt(balance.balance) > 1)
      .map(([token]) => tokenSymbolByAddress[token.toLowerCase()])
      .filter(symbol => curveSymbols.includes(symbol)) as Array<CurveLPToken>;

    const yearnCurveTokens = Object.entries(yearnTokens)
      .filter(([, data]) => curveSymbols.includes(data.underlying))
      .map(([token]) => token);

    const curvePoolsFromYearn = Object.entries(balances)
      .filter(([, balance]) => toBigInt(balance.balance) > 1)
      .map(([token]) => tokenSymbolByAddress[token.toLowerCase()])
      .filter(symbol => yearnCurveTokens.includes(symbol))
      .map(
        symbol => yearnTokens[symbol as YearnLPToken].underlying,
      ) as Array<CurveLPToken>;

    const convexCurveTokens = Object.entries(convexTokens)
      .filter(([, data]) => curveSymbols.includes(data.underlying))
      .map(([token]) => token);

    const curvePoolsFromConvex = Object.entries(balances)
      .filter(([, balance]) => toBigInt(balance.balance) > 1)
      .map(([token]) => tokenSymbolByAddress[token.toLowerCase()])
      .filter(symbol => convexCurveTokens.includes(symbol))
      .map(
        symbol => convexTokens[symbol as ConvexLPToken].underlying,
      ) as Array<CurveLPToken>;

    const curveSet = new Set([
      ...curvePools,
      ...curvePoolsFromYearn,
      ...curvePoolsFromConvex,
    ]);
    return Array.from(curveSet.values());
  }

  static next(path: PathOptionSerie): PathOptionSerie {
    let newPath = [...path];
    for (let i = path.length - 1; i >= 0; i--) {
      const po = { ...newPath[i] };
      po.option++;
      newPath[i] = po;

      if (po.option < po.totalOptions) return newPath;
      po.option = 0;
    }

    throw new Error("Path options overflow");
  }

  static detectNetwork(underlying: string): NetworkType {
    return tokenDataByNetwork.Mainnet[
      tokenSymbolByAddress[underlying.toLowerCase()]
    ].toLowerCase() === underlying.toLowerCase()
      ? "Mainnet"
      : "Arbitrum";
  }
}
