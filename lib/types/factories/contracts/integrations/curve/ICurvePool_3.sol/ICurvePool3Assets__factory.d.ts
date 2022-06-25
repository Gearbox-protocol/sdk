import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurvePool3Assets, ICurvePool3AssetsInterface } from "../../../../../contracts/integrations/curve/ICurvePool_3.sol/ICurvePool3Assets";
export declare class ICurvePool3Assets__factory {
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
    static createInterface(): ICurvePool3AssetsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurvePool3Assets;
}
