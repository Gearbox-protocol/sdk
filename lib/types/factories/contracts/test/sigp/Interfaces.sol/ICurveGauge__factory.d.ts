import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurveGauge, ICurveGaugeInterface } from "../../../../../contracts/test/sigp/Interfaces.sol/ICurveGauge";
export declare class ICurveGauge__factory {
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
    static createInterface(): ICurveGaugeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveGauge;
}
