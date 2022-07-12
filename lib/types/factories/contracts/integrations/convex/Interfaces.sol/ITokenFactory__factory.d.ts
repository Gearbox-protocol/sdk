import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ITokenFactory, ITokenFactoryInterface } from "../../../../../contracts/integrations/convex/Interfaces.sol/ITokenFactory";
export declare class ITokenFactory__factory {
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
    static createInterface(): ITokenFactoryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ITokenFactory;
}
