import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICreditManagerV2Events, ICreditManagerV2EventsInterface } from "../../../../contracts/interfaces/ICreditManagerV2.sol/ICreditManagerV2Events";
export declare class ICreditManagerV2Events__factory {
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
    static createInterface(): ICreditManagerV2EventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditManagerV2Events;
}
