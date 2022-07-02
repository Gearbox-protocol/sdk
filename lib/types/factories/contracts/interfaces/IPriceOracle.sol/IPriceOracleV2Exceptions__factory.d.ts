import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPriceOracleV2Exceptions, IPriceOracleV2ExceptionsInterface } from "../../../../contracts/interfaces/IPriceOracle.sol/IPriceOracleV2Exceptions";
export declare class IPriceOracleV2Exceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): IPriceOracleV2ExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceOracleV2Exceptions;
}
