import { BigNumber, BigNumberish } from "ethers";

import { contractParams, CurveParams } from "../contracts/contracts";
import { CurveLPToken, curveTokens } from "../tokens/curveLP";
import { tokenSymbolByAddress } from "../tokens/token";

export interface PathOption {
  target: string;
  option: number;
  totalOptions: number;
}

export type PathOptionSerie = Array<PathOption>;

export class PathOptionFactory {
  static generatePathOptions(
    balances: Record<string, BigNumberish>,
    loopsInTx: number,
  ): Array<PathOptionSerie> {
    const curveSymbols = Object.keys(curveTokens);

    const initPO: PathOptionSerie = Object.entries(balances)
      .filter(
        ([token, balance]) =>
          BigNumber.from(balance).gt(1) &&
          curveSymbols.includes(tokenSymbolByAddress[token.toLowerCase()]),
      )
      .map(([target]) => {
        return {
          target,
          option: 0,
          totalOptions: (
            contractParams[
              curveTokens[
                tokenSymbolByAddress[target.toLowerCase()] as CurveLPToken
              ].pool
            ] as CurveParams
          ).tokens.length,
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
}
