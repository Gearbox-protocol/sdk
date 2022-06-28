import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAdapterExceptions, IAdapterExceptionsInterface } from "../../../../../contracts/interfaces/adapters/IAdapter.sol/IAdapterExceptions";
export declare class IAdapterExceptions__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
    }[];
    static createInterface(): IAdapterExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAdapterExceptions;
}
