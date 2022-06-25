import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { CheatCodes, CheatCodesInterface } from "../../../../../contracts/test/lib/cheatCodes.sol/CheatCodes";
export declare class CheatCodes__factory {
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
    static createInterface(): CheatCodesInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): CheatCodes;
}
