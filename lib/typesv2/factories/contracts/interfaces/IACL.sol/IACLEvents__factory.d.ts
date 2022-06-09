import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IACLEvents, IACLEventsInterface } from "../../../../contracts/interfaces/IACL.sol/IACLEvents";
export declare class IACLEvents__factory {
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
    static createInterface(): IACLEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IACLEvents;
}
