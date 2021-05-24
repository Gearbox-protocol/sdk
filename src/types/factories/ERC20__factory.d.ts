import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ERC20 } from "../ERC20";
export declare class ERC20__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(name_: string, symbol_: string, overrides?: Overrides): Promise<ERC20>;
    getDeployTransaction(name_: string, symbol_: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): ERC20;
    connect(signer: Signer): ERC20__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): ERC20;
}
