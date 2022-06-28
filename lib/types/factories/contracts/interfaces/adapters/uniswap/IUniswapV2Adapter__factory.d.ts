import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IUniswapV2Adapter, IUniswapV2AdapterInterface } from "../../../../../contracts/interfaces/adapters/uniswap/IUniswapV2Adapter";
export declare class IUniswapV2Adapter__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
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
    })[];
    static createInterface(): IUniswapV2AdapterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV2Adapter;
}
