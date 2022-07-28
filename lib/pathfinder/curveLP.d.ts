import type { LPWithdrawPathFinder, Path } from "./path";
import { CurveLPToken } from "../tokens/curveLP";
import { CurvePoolContract } from "../contracts/contracts";
export declare class CurvePathFinder implements LPWithdrawPathFinder {
    lpToken: CurveLPToken;
    contract: CurvePoolContract;
    constructor(token: CurveLPToken);
    findWithdrawPaths(p: Path): Promise<Array<Path>>;
}
