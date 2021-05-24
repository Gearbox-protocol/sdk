import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { GearMathTest } from "../GearMathTest";
export declare class GearMathTest__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<GearMathTest>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): GearMathTest;
    connect(signer: Signer): GearMathTest__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): GearMathTest;
}
