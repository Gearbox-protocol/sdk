import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ILPPriceFeedEvents, ILPPriceFeedEventsInterface } from "../../../../contracts/interfaces/ILPPriceFeed.sol/ILPPriceFeedEvents";
export declare class ILPPriceFeedEvents__factory {
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
    static createInterface(): ILPPriceFeedEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ILPPriceFeedEvents;
}
