import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { TraderAccountFactory } from "../TraderAccountFactory";
export declare class TraderAccountFactory__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressProvider: string, overrides?: Overrides): Promise<TraderAccountFactory>;
    getDeployTransaction(addressProvider: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): TraderAccountFactory;
    connect(signer: Signer): TraderAccountFactory__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): TraderAccountFactory;
}
