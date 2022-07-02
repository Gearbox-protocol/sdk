import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBasicRewards, IBasicRewardsInterface } from "../../../../../contracts/integrations/convex/IRewards.sol/IBasicRewards";
export declare class IBasicRewards__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): IBasicRewardsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IBasicRewards;
}
