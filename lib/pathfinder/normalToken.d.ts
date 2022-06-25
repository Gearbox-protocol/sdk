import { Path, PathAsset } from "./path";
import { NormalToken } from "../tokens/normal";
export declare class NormalTokenPathFinder extends PathAsset {
    readonly token: NormalToken;
    constructor(_token: NormalToken);
    getBestPath(p: Path): Promise<Path>;
}
