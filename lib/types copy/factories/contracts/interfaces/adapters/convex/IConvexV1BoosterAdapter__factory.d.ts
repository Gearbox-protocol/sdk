import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IConvexV1BoosterAdapter, IConvexV1BoosterAdapterInterface } from "../../../../../contracts/interfaces/adapters/convex/IConvexV1BoosterAdapter";
export declare class IConvexV1BoosterAdapter__factory {
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
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): IConvexV1BoosterAdapterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IConvexV1BoosterAdapter;
}
