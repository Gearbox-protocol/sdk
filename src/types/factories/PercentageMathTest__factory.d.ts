import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { PercentageMathTest } from "../PercentageMathTest";
export declare class PercentageMathTest__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<PercentageMathTest>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): PercentageMathTest;
    connect(signer: Signer): PercentageMathTest__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): PercentageMathTest;
}
