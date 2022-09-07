import { Signer } from "ethers";

import { AdapterInterface } from "../contracts/adapters";
import { SupportedContract } from "../contracts/contracts";
import { PathFinderResultStructOutput } from "../types/contracts/pathfinder/interfaces/IPathFinder";
import { EVMTx } from "./eventOrTx";
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
  tradePath: PathFinderResultStructOutput;
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
    return {} as TXSwap;
  }
}
