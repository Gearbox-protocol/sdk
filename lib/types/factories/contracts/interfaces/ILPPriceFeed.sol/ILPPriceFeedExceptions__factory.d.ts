import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ILPPriceFeedExceptions, ILPPriceFeedExceptionsInterface } from "../../../../contracts/interfaces/ILPPriceFeed.sol/ILPPriceFeedExceptions";
export declare class ILPPriceFeedExceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): ILPPriceFeedExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ILPPriceFeedExceptions;
}
