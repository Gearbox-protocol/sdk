import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { TraderCreditAccount } from "../TraderCreditAccount";
export declare class TraderCreditAccount__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<TraderCreditAccount>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): TraderCreditAccount;
    connect(signer: Signer): TraderCreditAccount__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): TraderCreditAccount;
}
