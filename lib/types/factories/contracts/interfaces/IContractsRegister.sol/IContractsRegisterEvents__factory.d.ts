import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IContractsRegisterEvents, IContractsRegisterEventsInterface } from "../../../../contracts/interfaces/IContractsRegister.sol/IContractsRegisterEvents";
export declare class IContractsRegisterEvents__factory {
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
    static createInterface(): IContractsRegisterEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IContractsRegisterEvents;
}
