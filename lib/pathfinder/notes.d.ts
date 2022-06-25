import { PathAsset, Path } from "./pathfinder";
export declare class ConnectorPathAsset implements PathAsset {
    getBestPath(p: Path): Promise<Path>;
}
