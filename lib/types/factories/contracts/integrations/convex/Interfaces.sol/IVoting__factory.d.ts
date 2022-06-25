import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IVoting, IVotingInterface } from "../../../../../contracts/integrations/convex/Interfaces.sol/IVoting";
export declare class IVoting__factory {
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
    static createInterface(): IVotingInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IVoting;
}
