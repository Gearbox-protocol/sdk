import {
  MCall,
  PERCENTAGE_FACTOR,
  safeMulticall,
  toBigInt,
} from "@gearbox-protocol/sdk-gov";
import { BigNumber, providers } from "ethers";
import { Interface } from "ethers/lib/utils";

import { ParsedObject } from "../parsers/abstractParser";
import { BalancerV2VaultParser } from "../parsers/balancerV2VaultParser";
import { CurveAdapterParser } from "../parsers/curveAdapterParser";
import { LidoAdapterParser } from "../parsers/lidoAdapterParser";
import { TxParser } from "../parsers/txParser";
import { UniswapV2AdapterParser } from "../parsers/uniV2AdapterParser";
import { UniswapV3AdapterParser } from "../parsers/uniV3AdapterParser";
import { ICurvePool__factory } from "../types";
import { ICurvePoolInterface } from "../types/ICurvePool";
import { MultiCall } from "./core";

export interface FeeInfo {
  type: KnownFeeTypes;
  value: BigInt;
}

interface GetFeeState {
  simpleFees: Array<FeeInfo>;

  curve: Array<MCall<ICurvePoolInterface>>;
  balancer: Array<MCall<Interface>>;
}

interface FeeResponse {
  error?: Error | undefined;
  value?: BigNumber | undefined;
}

type KnownFeeTypes =
  | "curve"
  | "lido"
  | "uniswap_v2"
  | "uniswap_v3"
  | "balancer";

const CURVE_FEE_DECIMALS = 100000000n;
// PERCENTAGE_FACTOR

export class PathFinderUtils {
  static async findPathFees(
    calls: Array<MultiCall>,
    provider: providers.Provider,
    contractsByAdapter: Record<string, string>,
  ) {
    const pathObjects = TxParser.parseToObjectMultiCall(calls);

    const { simpleFees, curve, balancer } = pathObjects.reduce<GetFeeState>(
      (acc, pathSegment) => {
        if (!pathSegment) return acc;
        const { callObject, parser } = pathSegment;

        switch (true) {
          case parser instanceof UniswapV2AdapterParser: {
            const f = this.getUniswapV2Fee(callObject);
            if (f) acc.simpleFees.push(f);
            break;
          }

          case parser instanceof UniswapV3AdapterParser: {
            const f = this.getUniswapV3Fee(callObject);
            if (f) acc.simpleFees.push(f);
            break;
          }

          case parser instanceof LidoAdapterParser: {
            const f = this.getLidoFee();
            if (f) acc.simpleFees.push(f);
            break;
          }

          case parser instanceof CurveAdapterParser: {
            const call = this.getCurveFeeCall(callObject, contractsByAdapter);
            if (call) acc.curve.push(call);
            break;
          }

          case parser instanceof BalancerV2VaultParser: {
            const call = this.getBalancerFeeCall(
              callObject,
              contractsByAdapter,
            );
            if (call) acc.balancer.push(call);
            break;
          }
        }

        return acc;
      },
      {
        simpleFees: [],
        curve: [],
        balancer: [],
      },
    );

    const response = await safeMulticall<BigNumber>(
      [...curve, ...balancer],
      provider,
    );

    const curveEnds = curve.length;
    const curveResponse = response.slice(0, curveEnds);

    const balancerEnds = balancer.length;
    const balancerResponse = response.slice(curveEnds, balancerEnds);

    const curveFees = curveResponse.map(r => this.getCurveFee(r));
    const balancerFees = balancerResponse.map(r => this.getBalancerFee(r));

    const fees = [...simpleFees, ...curveFees, ...balancerFees];

    const s = TxParser.parseMultiCall(calls);
    console.log(s, fees);

    return fees;
  }

  static getUniswapV2Fee(callObject: ParsedObject): FeeInfo | null {
    const { name } = callObject.functionFragment;

    switch (name) {
      case "swapExactTokensForTokens":
      case "swapTokensForExactTokens":
      case "swapDiffTokensForTokens": {
        // 0.3%
        return {
          type: "uniswap_v2",
          value: 3000n,
        };
      }
      default:
        return null;
    }
  }

  static getUniswapV3Fee(callObject: ParsedObject): FeeInfo | null {
    const { name } = callObject.functionFragment;

    switch (name) {
      case "exactInputSingle":
      case "exactDiffInputSingle":
      case "exactOutputSingle": {
        const { params } = callObject.args || {};
        const { fee = 0 } = params || {};

        return {
          type: "uniswap_v3",
          value: toBigInt(fee),
        };
      }
      default:
        return null;
    }
  }

  static getCurveFeeCall(
    callObject: ParsedObject,
    contractsByAdapter: Record<string, string>,
  ): MCall<ICurvePoolInterface> | null {
    const { name } = callObject.functionFragment;

    switch (name) {
      case "exchange":
      case "exchange_underlying":
      case "exchange_diff":
      case "exchange_diff_underlying": {
        const adapter = (callObject.address || "").toLowerCase();
        const contract = contractsByAdapter[adapter];
        return contract
          ? {
              address: contract,
              interface: ICurvePool__factory.createInterface(),
              method: "fee()",
            }
          : null;
      }
      default:
        return null;
    }
  }

  static getCurveFee({ value }: FeeResponse): FeeInfo {
    const feeOriginal = toBigInt(value || 0n);
    return {
      type: "curve",
      value: (feeOriginal * PERCENTAGE_FACTOR) / CURVE_FEE_DECIMALS,
    };
  }

  static getBalancerFeeCall(
    callObject: ParsedObject,
    contractsByAdapter: Record<string, string>,
  ): MCall<Interface> | null {
    const { name } = callObject.functionFragment;

    console.log(contractsByAdapter, name);

    return null;
  }

  static getBalancerFee({ value }: FeeResponse): FeeInfo {
    const feeOriginal = toBigInt(value || 0n);

    return {
      type: "balancer",
      value: feeOriginal,
    };
  }

  static getLidoFee(): FeeInfo | null {
    return {
      type: "lido",
      value: 0n,
    };
  }
}
