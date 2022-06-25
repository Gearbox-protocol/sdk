import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurvePoolStETH, ICurvePoolStETHInterface } from "../../../../contracts/integrations/curve/ICurvePoolStETH";
export declare class ICurvePoolStETH__factory {
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
    static createInterface(): ICurvePoolStETHInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurvePoolStETH;
}
