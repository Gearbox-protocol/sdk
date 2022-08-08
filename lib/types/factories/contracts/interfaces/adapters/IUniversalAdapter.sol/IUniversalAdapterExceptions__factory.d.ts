import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IUniversalAdapterExceptions, IUniversalAdapterExceptionsInterface } from "../../../../../contracts/interfaces/adapters/IUniversalAdapter.sol/IUniversalAdapterExceptions";
export declare class IUniversalAdapterExceptions__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
    }[];
    static createInterface(): IUniversalAdapterExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IUniversalAdapterExceptions;
}
