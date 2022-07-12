import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICreditAccount, ICreditAccountInterface } from "../../../../contracts/interfaces/ICreditAccount.sol/ICreditAccount";
export declare class ICreditAccount__factory {
    static readonly abi: ({
        inputs: never[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
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
    })[];
    static createInterface(): ICreditAccountInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditAccount;
}
