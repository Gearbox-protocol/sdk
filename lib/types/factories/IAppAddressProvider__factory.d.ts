import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAppAddressProvider, IAppAddressProviderInterface } from "../IAppAddressProvider";
export declare class IAppAddressProvider__factory {
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
    static createInterface(): IAppAddressProviderInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAppAddressProvider;
}
