import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ACLTrait, ACLTraitInterface } from "../ACLTrait";
export declare class ACLTrait__factory {
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
        inputs: never[];
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
    static createInterface(): ACLTraitInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ACLTrait;
}
