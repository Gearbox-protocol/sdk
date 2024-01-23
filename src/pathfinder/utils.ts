import { providers } from "ethers";

import { ParsedObject } from "../parsers/abstractParser";
import { BalancerV2VaultParser } from "../parsers/balancerV2VaultParser";
import { CurveAdapterParser } from "../parsers/curveAdapterParser";
import { LidoAdapterParser } from "../parsers/lidoAdapterParser";
import { TxParser } from "../parsers/txParser";
import { UniswapV2AdapterParser } from "../parsers/uniV2AdapterParser";
import { UniswapV3AdapterParser } from "../parsers/uniV3AdapterParser";
import { MultiCall } from "./core";

export interface FeeInfo {
  type: KnownFeeTypes;
  value: BigInt;
}

type KnownFeeTypes =
  | "curve"
  | "lido"
  | "uniswap_v2"
  | "uniswap_v3"
  | "balancer";

export class PathFinderUtils {
  static findPathFees(calls: Array<MultiCall>, provider: providers.Provider) {
    const o = TxParser.parseToObjectMultiCall(calls);

    const res = o.map(pathSegment => {
      if (!pathSegment) return null;
      const { callObject, parser } = pathSegment || {};

      switch (true) {
        case parser instanceof UniswapV2AdapterParser:
          return this.getUniswapV2Fee(callObject);
        case parser instanceof UniswapV3AdapterParser:
          return this.getUniswapV3Fee(callObject);

        case parser instanceof LidoAdapterParser:
          return this.getLidoFee();

        case parser instanceof CurveAdapterParser:
          return this.getCurveFee(callObject);

        case parser instanceof BalancerV2VaultParser:
          return this.getBalancerFee(callObject);

        default:
          return null;
      }
    });

    return res;
  }

  static getUniswapV2Fee(callObject: ParsedObject): FeeInfo | null {
    const { name } = callObject.functionFragment;

    switch (name) {
      case "swapExactTokensForTokens":
      case "swapTokensForExactTokens":
      case "swapDiffTokensForTokens":
        // 0.3%
        return {
          type: "uniswap_v2",
          value: 30n,
        };
      default:
        return null;
    }
  }

  static getUniswapV3Fee(callObject: ParsedObject): FeeInfo | null {
    const { name } = callObject.functionFragment;

    switch (name) {
      case "exactInputSingle":
      case "exactDiffInputSingle":
      case "exactInput":
      case "exactDiffInput":
      case "exactOutput":
      case "exactOutputSingle":
        return {
          type: "uniswap_v3",
          value: 0n,
        };
      default:
        return null;
    }
  }

  static getCurveFee(callObject: ParsedObject): FeeInfo | null {
    const { name } = callObject.functionFragment;

    switch (name) {
      case "exchange":
      case "exchange_underlying":
      case "exchange_diff":
      case "exchange_diff_underlying":
        return {
          type: "curve",
          value: 0n,
        };
      default:
        return null;
    }
  }

  static getBalancerFee(callObject: ParsedObject): FeeInfo | null {
    const { name } = callObject.functionFragment;

    return {
      type: "balancer",
      value: 0n,
    };
  }

  static getLidoFee(): FeeInfo | null {
    return {
      type: "lido",
      value: 0n,
    };
  }
}
