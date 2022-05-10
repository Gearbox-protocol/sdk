import { BigNumber } from "ethers";
import { CreditManagerData } from "./creditManager";
import { MultiCall } from "./multicall";
import { SupportedTokens } from "./token";

export interface Path {
  calls: Array<MultiCall>;
  balances: Record<SupportedTokens, BigNumber>;
//   usedTokens: Array<SupportedTokens>;
  gasUsed: number;
  pool: SupportedTokens;
  creditManager: CreditManagerData;

  getBestPath(): Promise<Path>;
  // Get balances and keep non-zero only
  // Find token with highest priority
  // Get token type of this token
  // switch (type) {
  //  case TokenType.YearnValut:
  //     const assetPathClass = new YearnVaultPathAsset(tokenData);
  //     return assetPathClass.getBestPath(this);
  //     ...
  //}
}

export interface PathAsset {
  getBestPath(p: Path): Promise<Path>;
}

export class ConnectorPathAsset implements PathAsset {
  getBestPath(p: Path): Promise<Path> {
    console.log(p);
    // How to unwrap 
    // set balance of current token to 0
    // add balnace what we get 
    // add call
    // create new Paths
    // return maxValuable(new Paths.getBestPath())
    throw new Error("Method not implemented.");
  }
}
