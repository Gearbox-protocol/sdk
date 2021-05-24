import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CreditManagerMockForFilter } from "../CreditManagerMockForFilter";
export declare class CreditManagerMockForFilter__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<CreditManagerMockForFilter>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): CreditManagerMockForFilter;
    connect(signer: Signer): CreditManagerMockForFilter__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): CreditManagerMockForFilter;
}
