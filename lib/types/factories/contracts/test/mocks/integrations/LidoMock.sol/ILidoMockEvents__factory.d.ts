import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ILidoMockEvents, ILidoMockEventsInterface } from "../../../../../../contracts/test/mocks/integrations/LidoMock.sol/ILidoMockEvents";
export declare class ILidoMockEvents__factory {
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
    static createInterface(): ILidoMockEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ILidoMockEvents;
}
