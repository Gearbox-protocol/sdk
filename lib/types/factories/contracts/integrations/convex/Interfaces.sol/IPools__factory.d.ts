import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPools, IPoolsInterface } from "../../../../../contracts/integrations/convex/Interfaces.sol/IPools";
export declare class IPools__factory {
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
    static createInterface(): IPoolsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPools;
}
