import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurveV1AdapterGauge, ICurveV1AdapterGaugeInterface } from "../../../../../../contracts/interfaces/adapters/curve/ICurveV1AdapterGauge.sol/ICurveV1AdapterGauge";
export declare class ICurveV1AdapterGauge__factory {
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
    static createInterface(): ICurveV1AdapterGaugeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveV1AdapterGauge;
}
