import { SupportedToken } from "../core/token";
import { Path, PathAsset } from "./path";
export declare class YearnVaultOfCurveLPPathAsset extends PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
