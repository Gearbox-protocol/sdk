import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICreditManager } from "../ICreditManager";
export declare class ICreditManager__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditManager;
}
