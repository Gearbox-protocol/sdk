import { SupportedToken } from "../core/token";
import { Path, PathAsset } from "./path";
export declare class NormalTokenPathAsset extends PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
