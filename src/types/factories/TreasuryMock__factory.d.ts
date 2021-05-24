import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { TreasuryMock } from "../TreasuryMock";
export declare class TreasuryMock__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<TreasuryMock>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): TreasuryMock;
    connect(signer: Signer): TreasuryMock__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): TreasuryMock;
}
