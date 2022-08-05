import { YearnLPToken } from "../tokens/yearn";
import { NormalToken } from "../tokens/normal";
import { CurveLPToken } from "../tokens/curveLP";
import type { Path, LPWithdrawPathFinder } from "./path";
export declare class YearnVaultPathFinder implements LPWithdrawPathFinder {
    _vault: YearnLPToken;
    token: NormalToken | CurveLPToken;
    constructor(vault: YearnLPToken);
    findWithdrawPaths(path: Path): Promise<Array<Path>>;
}
