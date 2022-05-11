import { BigNumber } from "ethers";
import { CreditManagerData } from "./creditManager";
import { MultiCall } from "./multicall";
import { SupportedTokens } from "./token";
export declare class Path {
    readonly calls: Array<MultiCall>;
    readonly balances: Record<SupportedTokens, BigNumber>;
    protected _gasUsed: number;
    readonly pool: SupportedTokens;
    readonly creditManager: CreditManagerData;
    constructor(opts: {
        gasUsed: number;
        balances: Record<SupportedTokens, BigNumber>;
        pool: SupportedTokens;
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
