import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAccountFactory } from "../IAccountFactory";
export declare class IAccountFactory__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IAccountFactory;
}
