import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IUniswapV2Router02, IUniswapV2Router02Interface } from "../../../../contracts/integrations/uniswap/IUniswapV2Router02";
export declare class IUniswapV2Router02__factory {
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
    static createInterface(): IUniswapV2Router02Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV2Router02;
}
