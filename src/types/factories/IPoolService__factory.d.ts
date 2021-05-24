import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IPoolService } from "../IPoolService";
export declare class IPoolService__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IPoolService;
}
