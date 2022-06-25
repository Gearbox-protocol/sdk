import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ILidoV1Adapter, ILidoV1AdapterInterface } from "../../../../../../contracts/interfaces/adapters/lido/ILidoV1Adapter.sol/ILidoV1Adapter";
export declare class ILidoV1Adapter__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        anonymous?: undefined;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
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
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): ILidoV1AdapterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ILidoV1Adapter;
}
