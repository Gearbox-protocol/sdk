import type { LPWithdrawPathFinder, Path } from "./path";
export declare class ConvexLPPathFinder implements LPWithdrawPathFinder {
    findWithdrawPaths(p: Path): Promise<Array<Path>>;
}
