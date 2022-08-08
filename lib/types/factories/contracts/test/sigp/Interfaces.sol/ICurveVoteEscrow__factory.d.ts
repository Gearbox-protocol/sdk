import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurveVoteEscrow, ICurveVoteEscrowInterface } from "../../../../../contracts/test/sigp/Interfaces.sol/ICurveVoteEscrow";
export declare class ICurveVoteEscrow__factory {
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
    static createInterface(): ICurveVoteEscrowInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveVoteEscrow;
}
