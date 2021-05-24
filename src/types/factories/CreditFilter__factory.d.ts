import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CreditFilter } from "../CreditFilter";
export declare class CreditFilter__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_addressProvider: string, _underlyingToken: string, overrides?: Overrides): Promise<CreditFilter>;
    getDeployTransaction(_addressProvider: string, _underlyingToken: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): CreditFilter;
    connect(signer: Signer): CreditFilter__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): CreditFilter;
}
