import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { AbstractCreditManager } from "../AbstractCreditManager";
export declare class AbstractCreditManager__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): AbstractCreditManager;
}
