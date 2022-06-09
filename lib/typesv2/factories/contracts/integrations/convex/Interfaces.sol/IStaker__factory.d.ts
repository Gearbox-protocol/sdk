import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IStaker, IStakerInterface } from "../../../../../contracts/integrations/convex/Interfaces.sol/IStaker";
export declare class IStaker__factory {
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
    static createInterface(): IStakerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IStaker;
}
