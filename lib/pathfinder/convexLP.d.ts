import { LPWithdrawPathFinder, Path } from "./path";
export declare class ConvexLPPathFinder extends LPWithdrawPathFinder {
    findWithdrawPaths(p: Path): Promise<Array<Path>>;
}
