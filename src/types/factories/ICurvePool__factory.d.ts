import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurvePool } from "../ICurvePool";
export declare class ICurvePool__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurvePool;
}
