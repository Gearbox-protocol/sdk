import { BigNumber } from "ethers";
import { SupportedToken } from "../core/token";
import { Path, PathAsset } from "./path";
export declare class ConnectorPathAsset implements PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
    getMaxPoolAmount(currentToken: SupportedToken, currentBalance: BigNumber, p: Path): Promise<[BigNumber, BigNumber]>;
}
export declare class YearnVaultPathAsset implements PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
export declare class ConvexLPTokenPathAsset implements PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
export declare class CurveLPPathAsset implements PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
export declare class MetaCurveLPPathAsset implements PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
export declare class NormalTokenPathAsset implements PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
export declare class YearnVaultOfCurveLPPathAsset implements PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
export declare class YearnVaultOfMetaCurveLPPathAsset implements PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
