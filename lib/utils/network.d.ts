import { ethers } from "ethers";
import { NetworkType } from "../core/constants";
export declare function detectNetwork(provider: ethers.providers.Provider): Promise<NetworkType>;
