import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAppPoolService, IAppPoolServiceInterface } from "../IAppPoolService";
export declare class IAppPoolService__factory {
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
    static createInterface(): IAppPoolServiceInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAppPoolService;
}
