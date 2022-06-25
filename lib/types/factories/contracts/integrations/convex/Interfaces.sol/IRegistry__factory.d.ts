import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IRegistry, IRegistryInterface } from "../../../../../contracts/integrations/convex/Interfaces.sol/IRegistry";
export declare class IRegistry__factory {
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
    static createInterface(): IRegistryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IRegistry;
}
