import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IUniswapV3AdapterExceptions, IUniswapV3AdapterExceptionsInterface } from "../../../../../../contracts/interfaces/adapters/uniswap/IUniswapV3Adapter.sol/IUniswapV3AdapterExceptions";
export declare class IUniswapV3AdapterExceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): IUniswapV3AdapterExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV3AdapterExceptions;
}
