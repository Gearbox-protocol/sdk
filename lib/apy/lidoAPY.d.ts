import { providers } from "ethers";
import { NetworkType } from "../core/constants";
export declare function getLidoAPY(provider: providers.Provider, networkType: NetworkType): Promise<readonly [import("ethers").BigNumber, number]>;
export declare const LIDO_FEE_DECIMALS = 10000;
