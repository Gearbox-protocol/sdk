import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { AggregatorV3Interface, AggregatorV3InterfaceInterface } from "../AggregatorV3Interface";
export declare class AggregatorV3Interface__factory {
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
    static createInterface(): AggregatorV3InterfaceInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): AggregatorV3Interface;
}
