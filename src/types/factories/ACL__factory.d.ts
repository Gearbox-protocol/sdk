import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ACL } from "../ACL";
export declare class ACL__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<ACL>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): ACL;
    connect(signer: Signer): ACL__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): ACL;
}
