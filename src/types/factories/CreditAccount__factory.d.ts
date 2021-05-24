import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CreditAccount } from "../CreditAccount";
export declare class CreditAccount__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<CreditAccount>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): CreditAccount;
    connect(signer: Signer): CreditAccount__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): CreditAccount;
}
