import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ILidoV1AdapterEvents, ILidoV1AdapterEventsInterface } from "../../../../../../contracts/interfaces/adapters/lido/ILidoV1Adapter.sol/ILidoV1AdapterEvents";
export declare class ILidoV1AdapterEvents__factory {
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
    static createInterface(): ILidoV1AdapterEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ILidoV1AdapterEvents;
}
