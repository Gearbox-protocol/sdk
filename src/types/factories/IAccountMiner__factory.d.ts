import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAccountMiner } from "../IAccountMiner";
export declare class IAccountMiner__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IAccountMiner;
}
