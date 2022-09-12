import { Signer } from "ethers";

import { AdapterInterface } from "../contracts/adapters";
import { SupportedContract } from "../contracts/contracts";
import { PathFinderResult } from "../pathfinder/core";

interface BaseAdapterProps {
  name: string;
  adapterInterface: AdapterInterface;
  contractAddress: string;
  adapterAddress: string;
  contractSymbol: SupportedContract;
  creditManager: string;
}

interface ExecuteProps {
  tradePath: PathFinderResult;
  slippage: number;
  signer: Signer;
}

export class BaseAdapter {
  readonly name: string;
  readonly adapterInterface: AdapterInterface;
  readonly contractAddress: string;
  readonly adapterAddress: string;
  readonly contractSymbol: SupportedContract;
  readonly creditManager: string;

  constructor(props: BaseAdapterProps) {
    this.name = props.name;
    this.adapterInterface = props.adapterInterface;
    this.adapterAddress = props.adapterAddress;
    this.contractAddress = props.contractAddress;
    this.contractSymbol = props.contractSymbol;
    this.creditManager = props.creditManager;
  }
}
