import { AdapterInterface } from "../contracts/adapters";
import {
  contractParams,
  contractsByAddress,
  contractsByNetwork,
  SupportedContract,
} from "../contracts/contracts";
import { NetworkType } from "../core/chains";
import { SupportedToken } from "../tokens/token";
import { MultiCallStruct } from "../types/@gearbox-protocol/router/contracts/interfaces/IClosePathResolver";
import { AbstractParser } from "./abstractParser";
import { AddressProviderParser } from "./addressProviderParser";
import { ConvexBaseRewardPoolAdapterParser } from "./convexBaseRewardPoolAdapterParser";
import { ConvexBoosterAdapterParser } from "./convexBoosterAdapterParser";
import { CreditFacadeParser } from "./creditFacadeParser";
import { CurveAdapterParser } from "./curveAdapterParser";
import { IParser } from "./iParser";
import { LidoAdapterParser } from "./lidoAdapterParser";
import { MulticallParser } from "./multicallParser";
import { UniswapV2AdapterParser } from "./uniV2AdapterParser";
import { UniswapV3AdapterParser } from "./uniV3AdapterParser";
import { WstETHAdapterParser } from "./wstETHAdapterParser";
import { YearnV2AdapterParser } from "./yearnV2AdapterParser";

export interface AdapterForParser {
  adapter: string;
  contract: string;
}

interface ParseData {
  contract: string;
  adapterName: string;
}

export class TxParser {
  protected static parsers: Record<string, IParser & AbstractParser> = {};

  public static parse(address: string, calldata: string): string {
    const parser = this.getParser(address);
    return parser.parse(calldata);
  }

  public static parseToObject(address: string, calldata: string) {
    const parser = this.getParser(address);
    return parser.parseToObject?.(address, calldata);
  }

  public static getParseData(address: string): ParseData {
    const parser = this.getParser(address);
    return { contract: parser.contract, adapterName: parser.adapterName };
  }

  public static parseMultiCall(calls: Array<MultiCallStruct>): Array<string> {
    return calls.map(call =>
      TxParser.parse(call.target, call.callData.toString()),
    );
  }

  public static parseToObjectMultiCall(calls: Array<MultiCallStruct>) {
    return calls.map(call =>
      TxParser.parseToObject(call.target, call.callData.toString()),
    );
  }

  public static addAdapters(adapters: Array<AdapterForParser>) {
    for (let a of adapters) {
      const contract = contractsByAddress[a.contract.toLowerCase()];
      if (contract && contractParams[contract]) {
        TxParser.addParser(
          a.adapter,
          contract,
          contractParams[contract].type,
          false,
        );
      } else {
        console.error(`Unknown address: ${contract} at ${a.contract}`);
      }
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

  public static addAddressProvider(address: string) {
    this.parsers[address.toLowerCase()] = new AddressProviderParser();
  }
  public static addMulticall(address: string) {
    this.parsers[address.toLowerCase()] = new MulticallParser();
  }

  public static getParser(address: string) {
    const parser = this.parsers[address.toLowerCase()];
    if (!parser) throw new Error(`Can find parser for ${address}`);
    return parser;
  }

  protected static addParser(
    address: string,
    contract: SupportedContract,
    adapterType: number,
    isContract: boolean,
  ) {
    const addressLC = address.toLowerCase();
    switch (AdapterInterface[adapterType]) {
      case "UNISWAP_V2_ROUTER":
        TxParser.parsers[addressLC] = new UniswapV2AdapterParser(
          contract,
          isContract,
        );
        break;

      case "UNISWAP_V3_ROUTER":
        TxParser.parsers[addressLC] = new UniswapV3AdapterParser(
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
        TxParser.parsers[addressLC] = new CurveAdapterParser(
          contract,
          isContract,
        );
        break;
      case "YEARN_V2":
        TxParser.parsers[addressLC] = new YearnV2AdapterParser(
          contract,
          isContract,
        );
        break;

      case "CONVEX_V1_BASE_REWARD_POOL":
        TxParser.parsers[addressLC] = new ConvexBaseRewardPoolAdapterParser(
          contract,
          isContract,
        );
        break;

      case "CONVEX_V1_BOOSTER":
        TxParser.parsers[addressLC] = new ConvexBoosterAdapterParser(
          contract,
          isContract,
        );
        break;
      case "CONVEX_V1_CLAIM_ZAP":
        break;
      case "LIDO_V1":
        TxParser.parsers[addressLC] = new LidoAdapterParser(
          contract,
          isContract,
        );
        break;
      case "LIDO_WSTETH_V1":
        TxParser.parsers[addressLC] = new WstETHAdapterParser(
          contract,
          isContract,
        );
        break;
    }
  }
}
