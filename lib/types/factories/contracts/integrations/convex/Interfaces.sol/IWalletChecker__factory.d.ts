import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IWalletChecker, IWalletCheckerInterface } from "../../../../../contracts/integrations/convex/Interfaces.sol/IWalletChecker";
export declare class IWalletChecker__factory {
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
    static createInterface(): IWalletCheckerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IWalletChecker;
}
