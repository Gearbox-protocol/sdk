import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IVersion, IVersionInterface } from "../../../contracts/interfaces/IVersion";
export declare class IVersion__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): IVersionInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IVersion;
}
