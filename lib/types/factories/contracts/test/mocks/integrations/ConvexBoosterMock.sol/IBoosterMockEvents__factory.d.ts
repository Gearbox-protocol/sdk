import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBoosterMockEvents, IBoosterMockEventsInterface } from "../../../../../../contracts/test/mocks/integrations/ConvexBoosterMock.sol/IBoosterMockEvents";
export declare class IBoosterMockEvents__factory {
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
    static createInterface(): IBoosterMockEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IBoosterMockEvents;
}
