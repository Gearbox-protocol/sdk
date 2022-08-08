import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICreditFacadeExtended, ICreditFacadeExtendedInterface } from "../../../../contracts/interfaces/ICreditFacade.sol/ICreditFacadeExtended";
export declare class ICreditFacadeExtended__factory {
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
    static createInterface(): ICreditFacadeExtendedInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditFacadeExtended;
}
