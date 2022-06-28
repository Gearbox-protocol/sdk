import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ILidoV1AdapterExceptions, ILidoV1AdapterExceptionsInterface } from "../../../../../../contracts/interfaces/adapters/lido/ILidoV1Adapter.sol/ILidoV1AdapterExceptions";
export declare class ILidoV1AdapterExceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): ILidoV1AdapterExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ILidoV1AdapterExceptions;
}
