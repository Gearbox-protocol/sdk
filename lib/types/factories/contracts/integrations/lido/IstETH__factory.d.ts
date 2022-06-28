import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IstETH, IstETHInterface } from "../../../../contracts/integrations/lido/IstETH";
export declare class IstETH__factory {
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
    static createInterface(): IstETHInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IstETH;
}
