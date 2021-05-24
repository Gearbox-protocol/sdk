import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV2Router01 } from "../IUniswapV2Router01";
export declare class IUniswapV2Router01__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV2Router01;
}
