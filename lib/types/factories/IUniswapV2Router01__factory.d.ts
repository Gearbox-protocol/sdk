import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV2Router01, IUniswapV2Router01Interface } from "../IUniswapV2Router01";
export declare class IUniswapV2Router01__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): IUniswapV2Router01Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV2Router01;
}
