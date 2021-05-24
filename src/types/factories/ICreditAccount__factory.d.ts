import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICreditAccount } from "../ICreditAccount";
export declare class ICreditAccount__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditAccount;
}
