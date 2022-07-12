import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IUniswapV3Adapter, IUniswapV3AdapterInterface } from "../../../../../../contracts/interfaces/adapters/uniswap/IUniswapV3Adapter.sol/IUniswapV3Adapter";
export declare class IUniswapV3Adapter__factory {
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
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
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
    static createInterface(): IUniswapV3AdapterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV3Adapter;
}
