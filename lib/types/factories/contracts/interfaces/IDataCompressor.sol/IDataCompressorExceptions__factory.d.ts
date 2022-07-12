import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IDataCompressorExceptions, IDataCompressorExceptionsInterface } from "../../../../contracts/interfaces/IDataCompressor.sol/IDataCompressorExceptions";
export declare class IDataCompressorExceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): IDataCompressorExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IDataCompressorExceptions;
}
