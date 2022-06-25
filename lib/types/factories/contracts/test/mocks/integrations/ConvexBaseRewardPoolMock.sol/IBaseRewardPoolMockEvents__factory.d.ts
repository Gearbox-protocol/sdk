import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBaseRewardPoolMockEvents, IBaseRewardPoolMockEventsInterface } from "../../../../../../contracts/test/mocks/integrations/ConvexBaseRewardPoolMock.sol/IBaseRewardPoolMockEvents";
export declare class IBaseRewardPoolMockEvents__factory {
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
    static createInterface(): IBaseRewardPoolMockEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IBaseRewardPoolMockEvents;
}
