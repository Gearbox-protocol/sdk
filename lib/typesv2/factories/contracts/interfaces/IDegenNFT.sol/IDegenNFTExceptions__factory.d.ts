import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IDegenNFTExceptions, IDegenNFTExceptionsInterface } from "../../../../contracts/interfaces/IDegenNFT.sol/IDegenNFTExceptions";
export declare class IDegenNFTExceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): IDegenNFTExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IDegenNFTExceptions;
}
