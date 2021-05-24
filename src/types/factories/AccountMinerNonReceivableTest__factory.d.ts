import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { AccountMinerNonReceivableTest } from "../AccountMinerNonReceivableTest";
export declare class AccountMinerNonReceivableTest__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(miner: string, overrides?: Overrides): Promise<AccountMinerNonReceivableTest>;
    getDeployTransaction(miner: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): AccountMinerNonReceivableTest;
    connect(signer: Signer): AccountMinerNonReceivableTest__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): AccountMinerNonReceivableTest;
}
