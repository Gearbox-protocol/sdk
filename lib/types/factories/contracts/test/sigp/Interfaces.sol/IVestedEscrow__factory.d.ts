import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IVestedEscrow, IVestedEscrowInterface } from "../../../../../contracts/test/sigp/Interfaces.sol/IVestedEscrow";
export declare class IVestedEscrow__factory {
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
    static createInterface(): IVestedEscrowInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IVestedEscrow;
}
