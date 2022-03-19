import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IYVault, IYVaultInterface } from "../IYVault";
export declare class IYVault__factory {
    static readonly abi: ({
        anonymous: boolean;
        inputs: {
            indexed: boolean;
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
        anonymous?: undefined;
    })[];
    static createInterface(): IYVaultInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IYVault;
}
