import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ILockedCvx, ILockedCvxInterface } from "../../../../../contracts/test/sigp/interfaces/ILockedCvx";
export declare class ILockedCvx__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: ({
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
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): ILockedCvxInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ILockedCvx;
}
