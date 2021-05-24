import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { AbstractAccountFactory } from "../AbstractAccountFactory";
export declare class AbstractAccountFactory__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): AbstractAccountFactory;
}
