import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ITokenMinter, ITokenMinterInterface } from "../../../../../contracts/test/sigp/Interfaces.sol/ITokenMinter";
export declare class ITokenMinter__factory {
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
    static createInterface(): ITokenMinterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ITokenMinter;
}
