import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IRewards, IRewardsInterface } from "../../../../../contracts/integrations/convex/IRewards.sol/IRewards";
export declare class IRewards__factory {
    static readonly abi: {
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
    }[];
    static createInterface(): IRewardsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IRewards;
}
