import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { AggregatorV3Interface } from "../AggregatorV3Interface";
export declare class AggregatorV3Interface__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): AggregatorV3Interface;
}
