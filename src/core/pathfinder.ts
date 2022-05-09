import { BigNumber } from "ethers";
import { CreditManagerData } from "./creditManager";
import { MultiCall } from "./multicall";
import { SupportedTokens } from "./token";

export interface Path {
  calls: Array<MultiCall>;
  balances: Record<SupportedTokens, BigNumber>;
  usedTokens: Array<SupportedTokens>;
  gasUsed: number;
  pool: SupportedTokens;
  creditManager: CreditManagerData;

  getBestPath(p: Path): Promise<Path>;
}

export interface PathAsset {
  getBestPath(p: Path): Promise<Path>;
}

export class ConnectorPathAsset implements PathAsset {
  getBestPath(p: Path): Promise<Path> {
    console.log(p);
    throw new Error("Method not implemented.");
  }
}
