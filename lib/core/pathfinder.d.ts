import { BigNumber, ethers } from "ethers";
import { CreditManagerData } from "./creditManager";
import { MultiCall } from "./multicall";
import { SupportedToken } from "./token";
import { NetworkType } from "./constants";
import { CreditAccountData } from "./creditAccount";
export declare class Path {
    readonly calls: Array<MultiCall>;
    readonly balances: Record<SupportedToken, BigNumber>;
    readonly pool: SupportedToken;
    readonly creditManager: CreditManagerData;
    readonly creditAccount: CreditAccountData;
    readonly networkType: NetworkType;
    readonly provider: ethers.providers.Provider;
    readonly totalGasLimit: BigNumber;
    constructor(opts: {
        balances: Record<SupportedToken, BigNumber>;
        pool: SupportedToken;
        creditManager: CreditManagerData;
        creditAccount: CreditAccountData;
        networkType: NetworkType;
        provider: ethers.providers.Provider;
        totalGasLimit: BigNumber;
    });
    getBestPath(): Promise<Path>;
}
export interface PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
export declare class ConnectorPathAsset implements PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
export declare class YearnVaultPathAsset implements PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}
