import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IDegenNFT, IDegenNFTInterface } from "../../../../contracts/interfaces/IDegenNFT.sol/IDegenNFT";
export declare class IDegenNFT__factory {
    static readonly abi: ({
        inputs: never[];
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
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): IDegenNFTInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IDegenNFT;
}
