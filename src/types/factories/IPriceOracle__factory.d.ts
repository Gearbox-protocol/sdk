import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IPriceOracle } from "../IPriceOracle";
export declare class IPriceOracle__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceOracle;
}
