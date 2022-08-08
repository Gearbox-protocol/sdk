import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IUniversalAdapter, IUniversalAdapterInterface } from "../../../../../contracts/interfaces/adapters/IUniversalAdapter.sol/IUniversalAdapter";
export declare class IUniversalAdapter__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
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
        inputs: ({
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
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): IUniversalAdapterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IUniversalAdapter;
}
