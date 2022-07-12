import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPriceOracleV2Events, IPriceOracleV2EventsInterface } from "../../../../contracts/interfaces/IPriceOracle.sol/IPriceOracleV2Events";
export declare class IPriceOracleV2Events__factory {
    static readonly abi: {
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
    }[];
    static createInterface(): IPriceOracleV2EventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceOracleV2Events;
}
