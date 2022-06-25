import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPriceFeedType, IPriceFeedTypeInterface } from "../../../contracts/interfaces/IPriceFeedType";
export declare class IPriceFeedType__factory {
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
    static createInterface(): IPriceFeedTypeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceFeedType;
}
