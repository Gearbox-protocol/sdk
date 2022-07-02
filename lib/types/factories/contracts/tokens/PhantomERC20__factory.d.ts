import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { PhantomERC20, PhantomERC20Interface } from "../../../contracts/tokens/PhantomERC20";
export declare class PhantomERC20__factory {
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
    static createInterface(): PhantomERC20Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): PhantomERC20;
}
