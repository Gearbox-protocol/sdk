import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurvePool128, ICurvePool128Interface } from "../../../../../contracts/integrations/curve/ICurvePool.sol/ICurvePool128";
export declare class ICurvePool128__factory {
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
    static createInterface(): ICurvePool128Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurvePool128;
}
