import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { PriceOracle } from "../PriceOracle";
export declare class PriceOracle__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressProvider: string, overrides?: Overrides): Promise<PriceOracle>;
    getDeployTransaction(addressProvider: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): PriceOracle;
    connect(signer: Signer): PriceOracle__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): PriceOracle;
}
