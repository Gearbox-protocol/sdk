import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IInterestRateModel } from "../IInterestRateModel";
export declare class IInterestRateModel__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IInterestRateModel;
}
