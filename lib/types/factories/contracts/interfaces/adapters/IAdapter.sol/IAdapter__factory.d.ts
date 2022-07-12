import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAdapter, IAdapterInterface } from "../../../../../contracts/interfaces/adapters/IAdapter.sol/IAdapter";
export declare class IAdapter__factory {
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
    })[];
    static createInterface(): IAdapterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAdapter;
}
