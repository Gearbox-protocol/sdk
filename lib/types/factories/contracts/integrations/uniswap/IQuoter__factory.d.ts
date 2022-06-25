import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IQuoter, IQuoterInterface } from "../../../../contracts/integrations/uniswap/IQuoter";
export declare class IQuoter__factory {
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
    static createInterface(): IQuoterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IQuoter;
}
