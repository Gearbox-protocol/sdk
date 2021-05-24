import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { TokenMock } from "../TokenMock";
export declare class TokenMock__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(name_: string, symbol_: string, overrides?: Overrides): Promise<TokenMock>;
    getDeployTransaction(name_: string, symbol_: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): TokenMock;
    connect(signer: Signer): TokenMock__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): TokenMock;
}
