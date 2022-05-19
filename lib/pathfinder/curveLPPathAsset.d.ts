import { SupportedToken } from "../core/token";
import { Path, PathAsset } from "./path";
export declare class CurveLPPathAsset extends PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
