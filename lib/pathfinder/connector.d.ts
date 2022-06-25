import { Path, PathAsset } from "./path";
import { NormalToken } from "../tokens/normal";
export declare class ConnectorPathFinder extends PathAsset {
    token: NormalToken;
    constructor(token: NormalToken);
    getBestPath(p: Path): Promise<Path>;
}
