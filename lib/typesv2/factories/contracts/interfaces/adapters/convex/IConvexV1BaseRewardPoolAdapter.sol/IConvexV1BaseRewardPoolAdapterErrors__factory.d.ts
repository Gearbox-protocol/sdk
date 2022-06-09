import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IConvexV1BaseRewardPoolAdapterErrors, IConvexV1BaseRewardPoolAdapterErrorsInterface } from "../../../../../../contracts/interfaces/adapters/convex/IConvexV1BaseRewardPoolAdapter.sol/IConvexV1BaseRewardPoolAdapterErrors";
export declare class IConvexV1BaseRewardPoolAdapterErrors__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
    }[];
    static createInterface(): IConvexV1BaseRewardPoolAdapterErrorsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IConvexV1BaseRewardPoolAdapterErrors;
}
