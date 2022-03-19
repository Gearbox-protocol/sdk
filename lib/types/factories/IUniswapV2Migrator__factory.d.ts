import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV2Migrator, IUniswapV2MigratorInterface } from "../IUniswapV2Migrator";
export declare class IUniswapV2Migrator__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): IUniswapV2MigratorInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV2Migrator;
}
