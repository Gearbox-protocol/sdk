import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IInterestRateModel, IInterestRateModelInterface } from "../IInterestRateModel";
export declare class IInterestRateModel__factory {
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
    static createInterface(): IInterestRateModelInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IInterestRateModel;
}
