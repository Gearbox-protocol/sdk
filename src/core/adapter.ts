import { Signer } from "ethers";

import { AdapterInterface } from "../contracts/adapters";
import { SupportedContract } from "../contracts/contracts";
import { EVMTx } from "./eventOrTx";
import { TradePath } from "./trade";
import { TXSwap } from "./transactions";

export enum AdapterType {
  Swap = 1,
  LP = 2,
}

interface BaseAdapterProps {
  name: string;
  type: AdapterType;
  adapterInterface: AdapterInterface;
  contractAddress: string;
  adapterAddress: string;
  contractSymbol: SupportedContract;
}

interface ExecuteProps {
  tradePath: TradePath;
  slippage: number;
  signer: Signer;
}

export class BaseAdapter {
  readonly name: string;
  readonly type: AdapterType;
  readonly adapterInterface: AdapterInterface;
  readonly contractAddress: string;
  readonly adapterAddress: string;
  readonly contractSymbol: SupportedContract;

  constructor(props: BaseAdapterProps) {
    this.name = props.name;
    this.type = props.type;
    this.adapterInterface = props.adapterInterface;
    this.adapterAddress = props.adapterAddress;
    this.contractAddress = props.contractAddress;
    this.contractSymbol = props.contractSymbol;
  }

  async execute(props: ExecuteProps): Promise<EVMTx> {
    console.debug(props);
    return {} as TXSwap;
  }

  static connect(tradePath: TradePath) {
    console.debug(tradePath);
    return new BaseAdapter({
      name: "",
      type: AdapterType.Swap,
      adapterInterface: AdapterInterface.NO_SWAP,
      adapterAddress: "",
      contractAddress: "",
      contractSymbol: "CONVEX_3CRV_POOL",
    });
  }
}
