import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { Pausable } from "../Pausable";
export declare class Pausable__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): Pausable;
}
