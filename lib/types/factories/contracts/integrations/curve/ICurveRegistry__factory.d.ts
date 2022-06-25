import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurveRegistry, ICurveRegistryInterface } from "../../../../contracts/integrations/curve/ICurveRegistry";
export declare class ICurveRegistry__factory {
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
    static createInterface(): ICurveRegistryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveRegistry;
}
