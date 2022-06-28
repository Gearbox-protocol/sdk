import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICreditManagerV2Exceptions, ICreditManagerV2ExceptionsInterface } from "../../../../contracts/interfaces/ICreditManagerV2.sol/ICreditManagerV2Exceptions";
export declare class ICreditManagerV2Exceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): ICreditManagerV2ExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditManagerV2Exceptions;
}
