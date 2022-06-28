import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IStashFactory, IStashFactoryInterface } from "../../../../../contracts/integrations/convex/Interfaces.sol/IStashFactory";
export declare class IStashFactory__factory {
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
    static createInterface(): IStashFactoryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IStashFactory;
}
