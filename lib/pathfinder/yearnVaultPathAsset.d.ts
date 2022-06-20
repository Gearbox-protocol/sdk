import { SupportedToken } from "../core/token";
import { Path, PathAsset } from "./path";
export declare class YearnVaultPathAsset extends PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
