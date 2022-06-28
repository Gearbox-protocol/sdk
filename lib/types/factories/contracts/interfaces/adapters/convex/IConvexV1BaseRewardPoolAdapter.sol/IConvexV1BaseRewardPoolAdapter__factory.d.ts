import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IConvexV1BaseRewardPoolAdapter, IConvexV1BaseRewardPoolAdapterInterface } from "../../../../../../contracts/interfaces/adapters/convex/IConvexV1BaseRewardPoolAdapter.sol/IConvexV1BaseRewardPoolAdapter";
export declare class IConvexV1BaseRewardPoolAdapter__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): IConvexV1BaseRewardPoolAdapterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IConvexV1BaseRewardPoolAdapter;
}
