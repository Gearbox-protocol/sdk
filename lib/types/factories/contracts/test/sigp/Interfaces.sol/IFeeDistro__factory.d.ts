import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IFeeDistro, IFeeDistroInterface } from "../../../../../contracts/test/sigp/Interfaces.sol/IFeeDistro";
export declare class IFeeDistro__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): IFeeDistroInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IFeeDistro;
}
