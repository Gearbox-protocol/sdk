import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurvePool2Assets, ICurvePool2AssetsInterface } from "../../../../../contracts/integrations/curve/ICurvePool_2.sol/ICurvePool2Assets";
export declare class ICurvePool2Assets__factory {
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
    static createInterface(): ICurvePool2AssetsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurvePool2Assets;
}
