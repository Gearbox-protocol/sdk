import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurveV1AdapterExceptions, ICurveV1AdapterExceptionsInterface } from "../../../../../../contracts/interfaces/adapters/curve/ICurveV1Adapter.sol/ICurveV1AdapterExceptions";
export declare class ICurveV1AdapterExceptions__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): ICurveV1AdapterExceptionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveV1AdapterExceptions;
}
