import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IRewardFactory, IRewardFactoryInterface } from "../../../../../contracts/test/sigp/Interfaces.sol/IRewardFactory";
export declare class IRewardFactory__factory {
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
    static createInterface(): IRewardFactoryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IRewardFactory;
}
