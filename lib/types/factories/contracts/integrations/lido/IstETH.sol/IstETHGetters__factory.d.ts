import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IstETHGetters, IstETHGettersInterface } from "../../../../../contracts/integrations/lido/IstETH.sol/IstETHGetters";
export declare class IstETHGetters__factory {
    static readonly abi: ({
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
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
        anonymous?: undefined;
    })[];
    static createInterface(): IstETHGettersInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IstETHGetters;
}
