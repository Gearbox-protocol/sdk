import { Signer } from "ethers";

import { AdapterInterface } from "../contracts/adapters";
import { SupportedContract } from "../contracts/contracts";
import { PathFinderResultStructOutput } from "../types/contracts/pathfinder/interfaces/IPathFinder";
import { EVMTx } from "./eventOrTx";

export enum AdapterType {
  Swap = 1,
  LP = 2,
}

export interface AdapterData {
  getType: () => AdapterType;

  getName: () => string;

  getAdapterInterface: () => AdapterInterface;

  getContractAddress: () => string;

  getAdapterAddress: () => string;

  getContractSymbol: () => SupportedContract | undefined;

  execute: (props: {
    tradePath: PathFinderResultStructOutput;
    slippage: number;
    signer: Signer;
  }) => Promise<EVMTx>;
}
