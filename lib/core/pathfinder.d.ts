import { BigNumber } from "ethers";
import { CreditManagerData } from "./creditManager";
import { MultiCall } from "./multicall";
import { SupportedToken } from "./token";
export declare class Path {
    readonly calls: Array<MultiCall>;
    readonly balances: Record<SupportedToken, BigNumber>;
    protected _gasUsed: number;
    readonly pool: SupportedToken;
    readonly creditManager: CreditManagerData;
    constructor(opts: {
        gasUsed: number;
        balances: Record<SupportedToken, BigNumber>;
        pool: SupportedToken;
        creditManager: CreditManagerData;
    });
    getBestPath(): Promise<Path>;
}
export interface PathAsset {
    getBestPath(p: Path): Promise<Path>;
}
export declare class ConnectorPathAsset implements PathAsset {
    getBestPath(p: Path): Promise<Path>;
}
