import {SupportedToken} from "../core/token";
import {Path, PathAsset} from "./path";

export class CurveLPPathAsset extends PathAsset {
    async getBestPath(currentToken: SupportedToken, p: Path): Promise<Path> {
        console.log(currentToken);
        console.log(p);
        throw Error("Not implemented yet.");
    }
}