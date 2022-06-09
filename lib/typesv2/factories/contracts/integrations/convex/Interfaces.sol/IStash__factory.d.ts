import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IStash, IStashInterface } from "../../../../../contracts/integrations/convex/Interfaces.sol/IStash";
export declare class IStash__factory {
    static readonly abi: ({
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): IStashInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IStash;
}
