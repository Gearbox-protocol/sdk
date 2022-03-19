import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAccountMiner, IAccountMinerInterface } from "../IAccountMiner";
export declare class IAccountMiner__factory {
    static readonly abi: ({
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): IAccountMinerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAccountMiner;
}
