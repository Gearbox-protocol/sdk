import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPriceFeedAddress, IPriceFeedAddressInterface } from "../../../contracts/interfaces/IPriceFeedAddress";
export declare class IPriceFeedAddress__factory {
    static readonly abi: {
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
    }[];
    static createInterface(): IPriceFeedAddressInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceFeedAddress;
}
