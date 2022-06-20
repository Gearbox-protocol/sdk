import { BigNumber } from "ethers";
import { SupportedToken } from "../core/token";
import { Path, PathAsset } from "./path";
export declare class ConnectorPathAsset extends PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
    getMaxPoolAmount(currentToken: SupportedToken, currentBalance: BigNumber, p: Path): Promise<BigNumber>;
}
