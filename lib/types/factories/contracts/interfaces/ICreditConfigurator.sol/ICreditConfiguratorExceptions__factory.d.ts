import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICreditConfiguratorExceptions, ICreditConfiguratorExceptionsInterface } from "../../../../contracts/interfaces/ICreditConfigurator.sol/ICreditConfiguratorExceptions";
export declare class ICreditConfiguratorExceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): ICreditConfiguratorExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditConfiguratorExceptions;
}
