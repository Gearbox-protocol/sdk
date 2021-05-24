import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ACLTraitTest } from "../ACLTraitTest";
export declare class ACLTraitTest__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressProvider: string, overrides?: Overrides): Promise<ACLTraitTest>;
    getDeployTransaction(addressProvider: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): ACLTraitTest;
    connect(signer: Signer): ACLTraitTest__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): ACLTraitTest;
}
