import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICreditFacadeEvents, ICreditFacadeEventsInterface } from "../../../../contracts/interfaces/ICreditFacade.sol/ICreditFacadeEvents";
export declare class ICreditFacadeEvents__factory {
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
    static createInterface(): ICreditFacadeEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditFacadeEvents;
}
