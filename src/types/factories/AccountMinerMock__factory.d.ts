import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { AccountMinerMock } from "../AccountMinerMock";
export declare class AccountMinerMock__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressRepository: string, overrides?: Overrides): Promise<AccountMinerMock>;
    getDeployTransaction(addressRepository: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): AccountMinerMock;
    connect(signer: Signer): AccountMinerMock__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): AccountMinerMock;
}
