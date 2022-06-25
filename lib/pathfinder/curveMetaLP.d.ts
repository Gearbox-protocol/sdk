import { SupportedToken } from "../tokens/token";
import { Path, PathAsset } from "./path";
export declare class MetaCurveLPPathAsset extends PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
