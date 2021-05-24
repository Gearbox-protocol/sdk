import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { DieselToken } from "../DieselToken";
export declare class DieselToken__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(name_: string, symbol_: string, decimals_: BigNumberish, overrides?: Overrides): Promise<DieselToken>;
    getDeployTransaction(name_: string, symbol_: string, decimals_: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): DieselToken;
    connect(signer: Signer): DieselToken__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): DieselToken;
}
