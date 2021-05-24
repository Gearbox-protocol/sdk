import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { AccountMinerOwnFunds } from "../AccountMinerOwnFunds";
export declare class AccountMinerOwnFunds__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressRepository: string, overrides?: Overrides): Promise<AccountMinerOwnFunds>;
    getDeployTransaction(addressRepository: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): AccountMinerOwnFunds;
    connect(signer: Signer): AccountMinerOwnFunds__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): AccountMinerOwnFunds;
}
