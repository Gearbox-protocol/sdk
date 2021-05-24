import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { AbstractAccountMiner } from "../AbstractAccountMiner";
export declare class AbstractAccountMiner__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): AbstractAccountMiner;
}
