import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICreditFilter } from "../ICreditFilter";
export declare class ICreditFilter__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditFilter;
}
