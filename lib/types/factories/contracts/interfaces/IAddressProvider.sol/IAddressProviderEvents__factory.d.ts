import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAddressProviderEvents, IAddressProviderEventsInterface } from "../../../../contracts/interfaces/IAddressProvider.sol/IAddressProviderEvents";
export declare class IAddressProviderEvents__factory {
    static readonly abi: {
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
    }[];
    static createInterface(): IAddressProviderEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAddressProviderEvents;
}
