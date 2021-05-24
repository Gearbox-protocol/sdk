import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { GearToken } from "../GearToken";
export declare class GearToken__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<GearToken>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): GearToken;
    connect(signer: Signer): GearToken__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): GearToken;
}
