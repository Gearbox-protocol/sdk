import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { DataCompressor } from "../DataCompressor";
export declare class DataCompressor__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressProvider: string, overrides?: Overrides): Promise<DataCompressor>;
    getDeployTransaction(addressProvider: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): DataCompressor;
    connect(signer: Signer): DataCompressor__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): DataCompressor;
}
