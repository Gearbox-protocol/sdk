import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurveV1AdapterGaugeErrors, ICurveV1AdapterGaugeErrorsInterface } from "../../../../../../contracts/interfaces/adapters/curve/ICurveV1AdapterGauge.sol/ICurveV1AdapterGaugeErrors";
export declare class ICurveV1AdapterGaugeErrors__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
    }[];
    static createInterface(): ICurveV1AdapterGaugeErrorsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveV1AdapterGaugeErrors;
}
