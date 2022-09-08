import { AdapterInterface } from "../contracts/adapters";
import {
  contractParams,
  contractsByAddress,
  contractsByNetwork,
  SupportedContract,
} from "../contracts/contracts";
import { NetworkType } from "../core/constants";
import { SupportedToken } from "../tokens/token";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
import { ConvexBaseRewardPoolAdapterParser } from "./convexBaseRewardPoolAdapterParser";
import { ConvexBoosterAdapterParser } from "./convexBoosterAdapterParser";
import { CreditFacadeParser } from "./creditFacadeParser";
import { CurveAdapterParser } from "./curveAdapterParser";
import { IParser } from "./iParser";
import { LidoAdapterParser } from "./lidoAdapterParser";
import { UniswapV2AdapterParser } from "./uniV2AdapterParser";
import { UniswapV3AdapterParser } from "./uniV3AdapterParser";
import { YearnV2AdapterParser } from "./yearnV2AdapterParser";

export interface AdapterForParser {
  adapter: string;
  contract: string;
}

export class TxParser {
  protected static parsers: Record<string, IParser> = {};

  public static parse(address: string, calldata: string): string {
    const parser = this.parsers[address.toLowerCase()];
    if (!parser) throw new Error(`Can find parser for ${address}`);
    return parser.parse(calldata);
  }

  public static parseMultiCall(calls: Array<MultiCallStruct>): Array<string> {
    return calls.map(call =>
      TxParser.parse(call.target, call.callData.toString()),
    );
  }

  public static async addAdapters(adapters: Array<AdapterForParser>) {
    for (let a of adapters) {
      const contract = contractsByAddress[a.contract.toLowerCase()];
      TxParser.addParser(
        a.adapter,
        contract,
        contractParams[contract].type,
        false,
      );
    }
  }

  public static addContracts(network: NetworkType) {
    for (let c of Object.keys(contractParams) as Array<SupportedContract>) {
      const address = contractsByNetwork[network][c];
      TxParser.addParser(address, c, contractParams[c].type, true);
    }
  }

  public static addCreditFacade(
    creditFacade: string,
    underlying: SupportedToken,
  ) {
    this.parsers[creditFacade.toLowerCase()] = new CreditFacadeParser(
      underlying,
    );
  }

  protected static addParser(
    address: string,
    contract: SupportedContract,
    adapterType: number,
    isContract: boolean,
  ) {
    switch (AdapterInterface[adapterType]) {
      case "UNISWAP_V2_ROUTER":
        TxParser.parsers[address] = new UniswapV2AdapterParser(
          contract,
          isContract,
        );
        break;

      case "UNISWAP_V3_ROUTER":
        TxParser.parsers[address] = new UniswapV3AdapterParser(
          contract,
          isContract,
        );
        break;
      case "CURVE_V1_EXCHANGE_ONLY":
      case "CURVE_V1_2ASSETS":
      case "CURVE_V1_3ASSETS":
      case "CURVE_V1_4ASSETS":
      case "CURVE_V1_STECRV_POOL":
      case "CURVE_V1_WRAPPER":
        TxParser.parsers[address] = new CurveAdapterParser(
          contract,
          isContract,
        );
        break;
      case "YEARN_V2":
        TxParser.parsers[address] = new YearnV2AdapterParser(
          contract,
          isContract,
        );
        break;

      case "CONVEX_V1_BASE_REWARD_POOL":
        TxParser.parsers[address] = new ConvexBaseRewardPoolAdapterParser(
          contract,
          isContract,
        );
        break;

      case "CONVEX_V1_BOOSTER":
        TxParser.parsers[address] = new ConvexBoosterAdapterParser(
          contract,
          isContract,
        );
        break;
      case "CONVEX_V1_CLAIM_ZAP":
        break;
      case "LIDO_V1":
        TxParser.parsers[address] = new LidoAdapterParser(contract, isContract);
        break;
    }
  }
}
