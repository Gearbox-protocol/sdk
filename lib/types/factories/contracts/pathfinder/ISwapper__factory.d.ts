import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ISwapper, ISwapperInterface } from "../../../contracts/pathfinder/ISwapper";
export declare class ISwapper__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            components: ({
                components: {
                    internalType: string;
                    name: string;
                    type: string;
                }[];
                internalType: string;
                name: string;
                type: string;
            } | {
                internalType: string;
                name: string;
                type: string;
                components?: undefined;
            })[];
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): ISwapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ISwapper;
}
