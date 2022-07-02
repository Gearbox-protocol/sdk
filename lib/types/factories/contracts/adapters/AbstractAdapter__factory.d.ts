import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { AbstractAdapter, AbstractAdapterInterface } from "../../../contracts/adapters/AbstractAdapter";
export declare class AbstractAdapter__factory {
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
    static createInterface(): AbstractAdapterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): AbstractAdapter;
}
