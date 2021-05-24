import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { AccountMinerAuction } from "../AccountMinerAuction";
export declare class AccountMinerAuction__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressProvider: string, overrides?: Overrides): Promise<AccountMinerAuction>;
    getDeployTransaction(addressProvider: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): AccountMinerAuction;
    connect(signer: Signer): AccountMinerAuction__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): AccountMinerAuction;
}
