import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { AddressProvider } from "../AddressProvider";
export declare class AddressProvider__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<AddressProvider>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): AddressProvider;
    connect(signer: Signer): AddressProvider__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): AddressProvider;
}
