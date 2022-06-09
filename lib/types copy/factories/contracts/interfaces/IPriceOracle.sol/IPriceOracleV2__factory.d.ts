import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPriceOracleV2, IPriceOracleV2Interface } from "../../../../contracts/interfaces/IPriceOracle.sol/IPriceOracleV2";
export declare class IPriceOracleV2__factory {
    static readonly abi: ({
        inputs: never[];
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
    static createInterface(): IPriceOracleV2Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceOracleV2;
}
