import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { VanillaTestAccountFactory } from "../VanillaTestAccountFactory";
export declare class VanillaTestAccountFactory__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressProvider: string, overrides?: Overrides): Promise<VanillaTestAccountFactory>;
    getDeployTransaction(addressProvider: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): VanillaTestAccountFactory;
    connect(signer: Signer): VanillaTestAccountFactory__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): VanillaTestAccountFactory;
}
