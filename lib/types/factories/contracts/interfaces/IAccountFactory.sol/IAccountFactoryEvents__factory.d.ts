import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAccountFactoryEvents, IAccountFactoryEventsInterface } from "../../../../contracts/interfaces/IAccountFactory.sol/IAccountFactoryEvents";
export declare class IAccountFactoryEvents__factory {
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
    static createInterface(): IAccountFactoryEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAccountFactoryEvents;
}
