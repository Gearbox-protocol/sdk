import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICreditManagerV2, ICreditManagerV2Interface } from "../../../../contracts/interfaces/ICreditManagerV2.sol/ICreditManagerV2";
export declare class ICreditManagerV2__factory {
    static readonly abi: ({
        inputs: never[];
        name: string;
        type: string;
        anonymous?: undefined;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
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
    static createInterface(): ICreditManagerV2Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditManagerV2;
}
