import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurvePool4Assets, ICurvePool4AssetsInterface } from "../../../../../contracts/integrations/curve/ICurvePool_4.sol/ICurvePool4Assets";
export declare class ICurvePool4Assets__factory {
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
    static createInterface(): ICurvePool4AssetsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurvePool4Assets;
}
