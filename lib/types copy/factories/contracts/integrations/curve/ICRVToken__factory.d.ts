import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICRVToken, ICRVTokenInterface } from "../../../../contracts/integrations/curve/ICRVToken";
export declare class ICRVToken__factory {
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
    static createInterface(): ICRVTokenInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICRVToken;
}
