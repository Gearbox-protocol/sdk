import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICreditConfiguratorEvents, ICreditConfiguratorEventsInterface } from "../../../../contracts/interfaces/ICreditConfigurator.sol/ICreditConfiguratorEvents";
export declare class ICreditConfiguratorEvents__factory {
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
    static createInterface(): ICreditConfiguratorEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditConfiguratorEvents;
}
