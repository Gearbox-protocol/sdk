import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAppCreditManager, IAppCreditManagerInterface } from "../IAppCreditManager";
export declare class IAppCreditManager__factory {
    static readonly abi: ({
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
    } | {
        inputs: ({
            internalType: string;
            name: string;
            type: string;
            components?: undefined;
        } | {
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        })[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): IAppCreditManagerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAppCreditManager;
}
