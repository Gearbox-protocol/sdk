import { Path, LPWithdrawPathFinder } from "./path";
import { YearnLPToken } from "../tokens/yearn";
import { NormalToken } from "../tokens/normal";
import { CurveLPToken } from "../tokens/curveLP";
export declare class YearnVaultPathFinder implements LPWithdrawPathFinder {
    _vault: YearnLPToken;
    token: NormalToken | CurveLPToken;
    constructor(vault: YearnLPToken);
    findWithdrawPaths(p: Path): Promise<Array<Path>>;
}
