import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurveV1Adapter, ICurveV1AdapterInterface } from "../../../../../contracts/interfaces/adapters/curve/ICurveV1Adapter";
export declare class ICurveV1Adapter__factory {
    static readonly abi: ({
        inputs: {
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
    })[];
    static createInterface(): ICurveV1AdapterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveV1Adapter;
}
