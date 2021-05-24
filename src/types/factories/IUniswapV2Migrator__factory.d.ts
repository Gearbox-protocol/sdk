import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV2Migrator } from "../IUniswapV2Migrator";
export declare class IUniswapV2Migrator__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV2Migrator;
}
