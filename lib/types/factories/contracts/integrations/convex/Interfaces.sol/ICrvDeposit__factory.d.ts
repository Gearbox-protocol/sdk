import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICrvDeposit, ICrvDepositInterface } from "../../../../../contracts/integrations/convex/Interfaces.sol/ICrvDeposit";
export declare class ICrvDeposit__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    } | {
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): ICrvDepositInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICrvDeposit;
}
