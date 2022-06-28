import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICreditFacadeExceptions, ICreditFacadeExceptionsInterface } from "../../../../contracts/interfaces/ICreditFacade.sol/ICreditFacadeExceptions";
export declare class ICreditFacadeExceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): ICreditFacadeExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditFacadeExceptions;
}
