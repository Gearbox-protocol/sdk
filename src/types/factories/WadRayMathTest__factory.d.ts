import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { WadRayMathTest } from "../WadRayMathTest";
export declare class WadRayMathTest__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<WadRayMathTest>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): WadRayMathTest;
    connect(signer: Signer): WadRayMathTest__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): WadRayMathTest;
}
