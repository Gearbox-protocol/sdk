import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ACLTrait } from "../ACLTrait";
export declare class ACLTrait__factory {
    static connect(address: string, signerOrProvider: Signer | Provider): ACLTrait;
}
