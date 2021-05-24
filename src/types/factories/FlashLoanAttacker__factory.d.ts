import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { FlashLoanAttacker } from "../FlashLoanAttacker";
export declare class FlashLoanAttacker__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(creditManageranager: string, overrides?: Overrides): Promise<FlashLoanAttacker>;
    getDeployTransaction(creditManageranager: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): FlashLoanAttacker;
    connect(signer: Signer): FlashLoanAttacker__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): FlashLoanAttacker;
}
