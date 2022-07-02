import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICrediAccountExceptions, ICrediAccountExceptionsInterface } from "../../../../contracts/interfaces/ICreditAccount.sol/ICrediAccountExceptions";
export declare class ICrediAccountExceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): ICrediAccountExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICrediAccountExceptions;
}
