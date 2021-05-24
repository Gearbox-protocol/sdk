import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV2Router02 } from "../IUniswapV2Router02";
export declare class IUniswapV2Router02__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV2Router02;
}
