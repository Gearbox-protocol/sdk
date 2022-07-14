import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICreditFacadeBalanceChecker, ICreditFacadeBalanceCheckerInterface } from "../../../../contracts/interfaces/ICreditFacade.sol/ICreditFacadeBalanceChecker";
export declare class ICreditFacadeBalanceChecker__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): ICreditFacadeBalanceCheckerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditFacadeBalanceChecker;
}
