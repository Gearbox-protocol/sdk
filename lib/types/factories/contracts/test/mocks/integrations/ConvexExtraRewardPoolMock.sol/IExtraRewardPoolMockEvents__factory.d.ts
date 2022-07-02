import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IExtraRewardPoolMockEvents, IExtraRewardPoolMockEventsInterface } from "../../../../../../contracts/test/mocks/integrations/ConvexExtraRewardPoolMock.sol/IExtraRewardPoolMockEvents";
export declare class IExtraRewardPoolMockEvents__factory {
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
    static createInterface(): IExtraRewardPoolMockEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IExtraRewardPoolMockEvents;
}
