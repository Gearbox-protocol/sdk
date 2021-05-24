import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CreditManagerMockForPoolTest } from "../CreditManagerMockForPoolTest";
export declare class CreditManagerMockForPoolTest__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_poolService: string, overrides?: Overrides): Promise<CreditManagerMockForPoolTest>;
    getDeployTransaction(_poolService: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): CreditManagerMockForPoolTest;
    connect(signer: Signer): CreditManagerMockForPoolTest__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): CreditManagerMockForPoolTest;
}
