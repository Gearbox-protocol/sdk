import { LPWithdrawPathFinder, Path } from "./path";
import { CurveLPToken } from "../tokens/curveLP";
import { CurvePoolContract } from "../core/contracts";
export declare class CurvePathFinder extends LPWithdrawPathFinder {
    lpToken: CurveLPToken;
    contract: CurvePoolContract;
    constructor(token: CurveLPToken);
    findWithdrawPaths(p: Path): Promise<Array<Path>>;
}
