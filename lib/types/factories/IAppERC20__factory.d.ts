import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAppERC20, IAppERC20Interface } from "../IAppERC20";
export declare class IAppERC20__factory {
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
    static createInterface(): IAppERC20Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAppERC20;
}
