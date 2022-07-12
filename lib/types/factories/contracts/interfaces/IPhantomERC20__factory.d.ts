import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPhantomERC20, IPhantomERC20Interface } from "../../../contracts/interfaces/IPhantomERC20";
export declare class IPhantomERC20__factory {
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
    static createInterface(): IPhantomERC20Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPhantomERC20;
}
