import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IDeposit, IDepositInterface } from "../../../../../contracts/test/sigp/Interfaces.sol/IDeposit";
export declare class IDeposit__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): IDepositInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IDeposit;
}
