import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPriceOracleV2Ext, IPriceOracleV2ExtInterface } from "../../../../contracts/interfaces/IPriceOracle.sol/IPriceOracleV2Ext";
export declare class IPriceOracleV2Ext__factory {
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
    static createInterface(): IPriceOracleV2ExtInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceOracleV2Ext;
}
